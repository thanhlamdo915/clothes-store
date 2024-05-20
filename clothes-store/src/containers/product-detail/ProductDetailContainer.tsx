import { Divider, Input, Radio, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { FixPriceFormat } from '../../common/price-format/FixPrice'
import { SalePrice } from '../../common/price-format/SalePrice'
import productService from '../../service/productService'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../redux/slice/cartSlice'
import { RootState } from '../../redux/store'
import { Review } from '../../components/review'


type ProductItemProps = {
  productId: string
}

type productDataType = {
  id: number
  name: string
  slug: string
  price: number
  description: string
  salePrice: number
  coverImage: string
  sizes: any
  deletedAt?: string
}

type sizeType = {
  id: number
  name: string
}

export const preventMinus = (e: any) => {
  if (e.code === 'Minus') {
    e.preventDefault()
  }
}

export const ProductDetailContainer = ({ productId }: ProductItemProps) => {
  const userData = useSelector((state: RootState) => state.auth)
  const [productData, setProductData] = useState<productDataType>()
  const [size, setSize] = useState<sizeType>()
  const [quantity, setQuantity] = useState(1)
  console.log('productData', productData)

  const dispatch = useDispatch()

  useEffect(() => {
    if (productId) {
      productService
        .getProductDetail(productId)
        .then((res) => setProductData(res.data))
        .catch((err) => console.log(err))
    }
  }, [productId, setProductData])

  const handleAddToCart = () => {
    if (!userData.isLoggedIn) {
      message.warning('Please login before add to cart !')
    } else if (size === undefined) {
      message.warning('Please choose a size !')
    } else if (!quantity || quantity.toString() === '0') {
      message.error('Please choose a quantity')
    }
    else {
      dispatch(
        addToCart({
          size: size,
          id: productData?.id!,
          name: productData?.name!,
          price: productData?.salePrice! < productData?.price! ? productData?.salePrice! : productData?.price!,
          quantity: quantity,
          coverImage: productData?.coverImage!,
        })
      )
      message.success('Product was added successfully')
    }
  }

  const onChange = (event: any) => {
    console.log(event.target.value)
    setQuantity(event.target.value)
  }
  return (
    <div className=" px-[8%] mt-[4vh] py-[2vh]">
      <div className="flex w-full bg-[#FFFFFF] p-[2vh]">
        <div className="basis-[50%] mr-[40px]">
          <img className="w-full aspect-[1/1] object-center" src={productData?.coverImage} alt={productData?.slug}></img>
        </div>
        <div className="basis-[50%] flex-col pl-[50px] pr-[50px]">
          <div className="text-[44px]">{productData?.name}</div>
          <div className="flex items-center">
            <FixPriceFormat fontSize="16px" price={productData?.price} />
            <SalePrice fontSize="24px" salePrice={productData?.salePrice} />
          </div>
          <p className="text-[20px]">{productData?.description}</p>
          <Divider />
          <div className="flex">
            <p className='pr-4'>Size: </p>
            <div className="flex justify-center items-center pl-4">
              <Radio.Group defaultValue={size}>
                {productData?.sizes.map((size: any) => (
                  <Radio.Button
                    value={size.name}
                    onClick={() => setSize({ name: size.name, id: size.id })}
                    className="px-6 mx-2 border focus:bg-baseColor active:duration-[300ms]"
                  >
                    {size.name}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </div>
          </div>
          <div className="flex mt-4 items-center">
            <div className='pr-3'>Quantity: </div>
            <Input
              min={0}
              onKeyPress={preventMinus}
              defaultValue={1}
              placeholder="1"
              className="w-1/4"
              type="number"
              onChange={onChange}
            />
          </div>
          <Divider />
          {
            productData?.deletedAt === null ? <div>
              <button
                onClick={handleAddToCart}
                className="h-[50px] w-1/2 bg-white border  pl-[30px] pr-[30px] hover:bg-baseColor hover:text-[#FFFFFF]"
              >
                <p>Add to cart</p>
              </button>
            </div> : <div className='border w-fit px-4 py-2 text-[#FFFFFF] bg-baseColor '>Product has been discontinued</div>
          }

        </div>
      </div>
      <div className='bg-[#FFFFFF] mt-4 py-4 px-[2vh]'>
        <Review productId={+productId} userId={userData.user?.id!} />
      </div>

    </div>
  )
}
