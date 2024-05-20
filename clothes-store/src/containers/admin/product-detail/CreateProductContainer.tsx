import { Button, Checkbox, Form, Input, Progress, Select, message } from 'antd';
import React, { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface'
import Upload, { RcFile } from 'antd/es/upload'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import storage from '../../../firebaseConfig';
import bigCategoriesService from '../../../service/admin-service/bigCategoryService';
import categoriesService from '../../../service/admin-service/categoryService';
import sizeService from '../../../service/admin-service/sizeService';
import { CloseCircleOutlined } from '@ant-design/icons';
import productService from '../../../service/admin-service/productService';
import { useLocation, useNavigate } from 'react-router';
import { CheckboxChangeEvent } from 'antd/es/checkbox';

type SizeType = {
  sizeId: string,
  sizeQuantity: number,
}

type ProductType = {
  name: string,
  price: number,
  description: string,
  coverImage: string,
  salePrice: number,
  type: any,
  bigCategory: any,
  category: any,
  sizes: SizeType[]
}

type TPops = {
  isUpdate?: boolean
}

export const CreateProductContainer: React.FC<TPops> = ({ isUpdate }) => {
  const { handleSubmit, control, setValue, getValues, watch, formState: { errors } } = useForm<ProductType>();
  const location = useLocation();
  const data = location.state?.status;
  const productId = data?.id

  const { fields, remove, append } = useFieldArray({
    name: 'sizes',
    control,
    rules: {
      required: 'Please select a size',
    },
  });
  const [percent, setPercent] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const typeOptions = [{
    value: 1,
    label: 'Men',
  },
  {
    value: 2,
    label: 'Women',
  },
  {
    value: 3,
    label: "Kids",
  }]
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [bigCategoryOptions, setBigCategoryOptions] = useState([])

  const [typeSelected, setTypeSelected] = useState();
  const [bigCategorySelect, setCategorySelect] = useState();
  const [sizeData, setSizeData] = useState([]);
  const [checked, setChecked] = useState(false);
  const priceWatch = watch('price')
  const navigate = useNavigate();

  const onChange = (e: CheckboxChangeEvent) => {
    setChecked(e.target.checked);
  };

  const onSubmit = () => {
    const data = getValues();
    if (!checked || data.salePrice === undefined) {
      data.salePrice = watch('price');
    }
    if (!isUpdate) {
      productService.createProduct({ ...data, categoryId: parseInt(data.category) ? parseInt(data.category) : undefined })
        .then((res) => {
          console.log(res);
          message.success('Create product successfully')
          navigate('/admin/product')
        })
        .catch((err) => {
          console.log('err', err);
          message.error('Something went wrong')
        })
    } else {
      productService.updateProduct(productId, { ...data, categoryId: parseInt(data.category) ? parseInt(data.category) : undefined })
        .then((res: any) => {
          message.success('Update product successfully')
        })
        .catch((err: any) => {
          console.log('err', err);
          message.error('Something went wrong')
        }
        )

    }
  }


  useEffect(() => {

    if (isUpdate) {
      productService.getProductDetail(productId)
        .then((res) => {
          console.log(res.data)
          console.log(res.data?.category.big_category.name!)
          setValue('name', res.data?.name!)
          setValue('price', res.data?.price!)
          setValue('description', res.data?.description!)
          setPreviewUrl(res.data?.coverImage!)
          setValue('coverImage', res.data?.coverImage!)
          setValue('salePrice', res.data?.salePrice!)
          setValue('category', res.data?.category.name!)
          setValue('bigCategory', res.data?.category.big_category.name!)
          setValue('type', res.data?.category.big_category.type.name!)
          setValue('sizes', res.data?.sizes!.map((size: any) => ({
            sizeId: size.id,
            sizeQuantity: size.Product_Size.quantity.toString(),
          })))
          setTypeSelected(res.data?.category.big_category.type.id!)
          setCategorySelect(res.data?.category.big_category.id!)
        })
        .catch((err) => console.log(err))
    }

  }, [isUpdate, productId, setValue])

  useEffect(() => {
    bigCategoriesService.getCategoryByType(typeSelected!)
      .then((res) => {
        setBigCategoryOptions(res.data.map((data: any) => {
          return {
            value: data.id,
            label: data.name,
          }
        }))
      })
      .catch((err) => console.log(err))
  }, [typeSelected])

  useEffect(() => {
    categoriesService.getCategoryByBigCategory(bigCategorySelect!)
      .then((res) => {
        setCategoryOptions(res.data.map((data: any) => {
          return {
            value: data.id,
            label: data.name,
          }
        }))
      })
      .catch((err) => console.log(err))
  }, [bigCategorySelect, typeSelected])

  useEffect(() => {
    sizeService.getAllSize()
      .then((res) => setSizeData(res.data.map((data: any) => {
        return {
          value: data.id,
          label: data.name,
        }
      })))
      .catch((err) => console.log(err))
  }, [typeSelected])

  // const filteredOptions = OPTIONS.filter((o) => !selectedItems.includes(o));

  const customRequest = async ({ file, onSuccess }: RcCustomRequestOptions) => {
    const fil = file as RcFile
    setPreviewUrl(URL.createObjectURL(fil))
    const storageRef = ref(storage, `/products/${fil.name}`) // progress can be paused and resumed. It also exposes progress updates. // Receives the storage reference and the file to upload.
    const uploadTask = uploadBytesResumable(storageRef, fil)
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) // update progress
        setPercent(percent)
      },
      (err) => console.log(err),
      () => {
        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setValue('coverImage', url)
          console.log(url)
        })
      }
    )
    onSuccess?.(true)
  }
  // useEffect(() => {
  //   console.log(getValues());
  // })
  return (
    <div className="bg-[#FFFFFF] px-2 mx-4 flex pb-10">

      <div className='basis-[60%] w-full'>
        <Form
          name="basic"
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 900 }}
          autoComplete="off"
          className='basis-[60%] m-4'
        >
          {
            isUpdate === true ? <div className='flex justify-center text-[24px] py-4'>Update product</div> : <div className='flex justify-center text-[24px] py-4'>Create product</div>
          }

          <Form.Item
            label="Product Name"
            name="name"
            labelCol={{ span: 4, offset: 1 }}
            help={<div>{!!errors && <div className="alert mt-1">{errors.name?.message?.toString()}</div>}</div>}
          >
            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Please enter a product name'
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Product Name"
                  className="mb-4 flex justify-center items-center"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </Form.Item>



          <Form.Item
            label="Description"
            name="description"
            labelCol={{ span: 4, offset: 1 }}
            help={<div>{!!errors && <div className="alert mt-1">{errors.description?.message?.toString()}</div>}</div>}
          >
            <Controller
              control={control}
              name="description"
              rules={{
                required: 'Please enter product description'
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Description"
                  className="mb-4 flex justify-center items-center"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Price"
            name="price"
            labelCol={{ span: 4, offset: 1 }}
            help={<div>{!!errors && <div className="alert mt-1">{errors.price?.message?.toString()}</div>}</div>}
          >
            <Controller
              control={control}
              name="price"
              rules={{
                required: 'Please enter product price'
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Price"
                  className="mb-4 flex justify-center items-center"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Is sale" className='pt-0' labelCol={{ span: 4, offset: 1 }}>
            <Checkbox onChange={onChange} />
          </Form.Item>

          <Form.Item
            label="Sale price"
            name="salePrice"
            labelCol={{ span: 4, offset: 1 }}
            help={<div>{!!errors && <div className="alert mt-1">{errors.salePrice?.message?.toString()}</div>}</div>}
          >
            <Controller
              control={control}
              name="salePrice"
              rules={{
                max: {
                  value: priceWatch,
                  message: "Sales price must be less than or equal price"
                }
              }}
              render={({ field: { value, onChange } }) => (
                <Input
                  disabled={!checked}
                  placeholder="Sale price"
                  className="mb-4 flex justify-center items-center"
                  value={checked === true ? value : priceWatch}
                  onChange={onChange}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            labelCol={{ span: 4, offset: 1 }}
            help={<div>{!!errors && <div className="alert mt-1">{errors.category?.message?.toString()}</div>}</div>}
          >
            <Controller
              control={control}
              name="type"
              rules={{
                required: 'Please enter product type'
              }}
              render={({ field: { value, onChange } }) => (
                <div>
                  <Select
                    style={{ width: 160 }}
                    placeholder="Choose type"
                    optionFilterProp="children"
                    onChange={(e) => {
                      setTypeSelected(e)
                      setValue('type', e);
                    }}
                    options={typeOptions}
                    value={value}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="bigCategory"
              rules={{
                required: 'Please enter product big category'
              }}
              render={({ field: { value, onChange } }) => (
                <div>
                  <Select
                    style={{ width: 160 }}
                    value={value}
                    placeholder="Choose big category"
                    optionFilterProp="children"
                    onChange={(e) => {
                      setCategorySelect(e)
                      setValue('bigCategory', e);
                    }}
                    options={bigCategoryOptions}
                  />
                </div>
              )}
            />
            <Controller
              control={control}
              name="category"
              rules={{
                required: 'Please enter product category'
              }}
              render={({ field: { value, onChange } }) => (
                <div>
                  <Select
                    showSearch
                    value={value}
                    onChange={onChange}
                    style={{ width: 160 }}
                    placeholder="Choose category"
                    optionFilterProp="children"
                    options={categoryOptions}
                  />
                </div>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Sizes"
            name="sizes"
            labelCol={{ span: 4, offset: 1 }}
            help={<div>{<div className="alert mt-1">{errors.sizes?.message?.toString()}</div>}</div>}
          >
            {fields.map((field: any, index) => {
              return (
                <div key={index} className="border-b border-solid border-gray-400 p-1">
                  <div className="flex items-center justify-between ">
                    <Controller
                      name={`sizes.${index}.sizeId`}
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Select
                          style={{ width: 160 }}
                          placeholder="Choose a size"
                          optionFilterProp="children"
                          onChange={onChange}
                          value={value}
                          options={sizeData}
                        />
                      )}
                    />

                    <Controller
                      name={`sizes.${index}.sizeQuantity`}
                      control={control}
                      rules={{
                        required: 'Please enter a quantity'
                      }}
                      render={({ field: { value, onChange } }) => (
                        <Input
                          className="!w-[80%] max-w-xs md:!w-[90%]"
                          value={value} // update this line
                          onChange={onChange}
                        />
                      )}
                    />

                    <CloseCircleOutlined
                      className="ml-4 cursor-pointer"
                      onClick={() => {
                        remove(index);
                        // handleDeleteQuestion(index);
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <Button onClick={() => append({ sizeId: '', sizeQuantity: 0 })} type="default" htmlType="submit">
              Add a size
            </Button>
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            {
              isUpdate === true ? (<Button onClick={handleSubmit(onSubmit)} type="default" htmlType="submit">
                Update product
              </Button>) : <Button onClick={handleSubmit(onSubmit)} type="default" htmlType="submit">
                Create product
              </Button>
            }


          </Form.Item>
        </Form>
      </div>
      <div className='basis-[40%] w-full flex-col justify-center items-center pt-12'>
        <img
          className="w-full aspect-square mb-4"
          src={previewUrl ? previewUrl : 'https://www.grouphealth.ca/wp-content/uploads/2018/05/placeholder-image-400x300.png'}
          alt={previewUrl}
        />

        <div className='flex justify-center'>
          <Upload
            customRequest={(e) => {
              customRequest({ ...e })
            }}
            maxCount={1}
            showUploadList={false}
          >
            <Button disabled={percent !== 0 && percent !== 100}>
              Upload product image
            </Button>
          </Upload>
        </div>
        {percent !== 0 && percent !== 100 && <Progress percent={percent} steps={5} />}
      </div>
    </div>
  )
}
