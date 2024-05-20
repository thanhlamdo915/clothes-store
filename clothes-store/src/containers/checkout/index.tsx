import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { Divider, Input, message } from 'antd'
import dayjs from 'dayjs'
import { CheckoutItem } from './CheckoutItem'
import { SalePrice } from '../../common/price-format/SalePrice'
import { TProductCart } from '../../components/cart/type'
import { authService } from '../../service/authService'
import transactionService from '../../service/transactionService'
import paymentService from '../../service/paymentService'
import { useNavigate } from 'react-router-dom';
export type UserDetailData = {
  id: number
  name: string
  email: string
  gender: string
  birthday: string
  phone: string
  address: string
  avatar: string
}

export const CheckoutContainer = () => {
  const authData = useSelector((state: RootState) => state.auth)
  const cartData = useSelector((state: RootState) => state.cart)
  const [userInfor, setUserInfor] = useState<UserDetailData>()
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  const getTotalPrice = (items: TProductCart[]) => {
    let totalPrice = 0
    for (const item of items) {
      totalPrice += item.price * item.quantity
    }
    return totalPrice
  }

  const totalPrice = getTotalPrice(cartData.items)

  const creataTransaction = async () => {
    const dataSubmit = {
      userId: authData.user?.id,
      productList: cartData.items.map((item) => ({
        sizeId: item.size.id,
        productId: item.id,
        quantity: item.quantity,
      })),
      transactionMethod: "cash",
      description: note,
      totalPrice: totalPrice
    }
    try {
      const res = await transactionService.createTransaction(dataSubmit);
      if (res) {
        message.success('Your transaction was successfully')
        const data = { status: 1 };
        navigate('/result', { state: { status: data } });
      } else {
        message.error('Can not create transaction')
      }
    } catch (error: any) {
      console.log(error);
      message.error('Something went wrong', 5)
    }


  }

  const handleOnlinePayment = async () => {
    const dataSubmit = {
      userId: authData.user?.id,
      productList: cartData.items.map((item) => ({
        sizeId: item.size.id,
        productId: item.id,
        quantity: item.quantity
      })),
      transactionMethod: "vnpay",
      description: note,
      totalPrice: totalPrice
    }
    try {
      const transaction = await transactionService.createTransaction(dataSubmit);
      if (!transaction) throw new Error("error")
      const paymentData = {
        transactionId: transaction.data.id,
        bankCode: "VNBANK",
        language: "vn"
      }
      const result = await paymentService.createPaymentURL(paymentData);
      window.location.href = result.data.url;
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    authService
      .getUserProfile(authData.user?.id!)
      .then((res) => {
        setUserInfor(res.data)
      })
      .catch((err) => console.log(err))
  }, [authData.user?.id])

  return (
    <div className="pl-[8%] pr-[8%] bg-[#FFFFFF] my-[4vh] py-[4vh] flex">
      <div className="basis-[60%] p-4">
        <div className="text-[24px]">Transaction detail</div>
        <div className="">
          <div>Receiver</div>
          <div>{userInfor?.name}</div>
          <Divider className="bg-[#e5e5e5] mt-0" />
        </div>
        <div className="">
          <div>Email: </div>
          <div>{userInfor?.email}</div>
          <Divider className="bg-[#e5e5e5] mt-0" />
        </div>
        <div className="">
          <div>Phone: </div>
          <div>{userInfor?.phone}</div>
          <Divider className="bg-[#e5e5e5] mt-0" />
        </div>
        <div className="">
          <div>Birthday: </div>
          <div>{userInfor?.birthday ? dayjs(userInfor?.birthday).format('DD-MM-YYYY').toString() : null}</div>
          <Divider className="bg-[#e5e5e5] mt-0" />
        </div>
        <div className="">
          <div>Address: </div>
          <div>{userInfor?.address}</div>
          <Divider className="bg-[#e5e5e5] mt-0" />
        </div>
        <div className="">
          <div>Addition Information: </div>
          <Input.TextArea autoSize={{ minRows: 3 }} value={note}
            onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
      <div className="basis-[40%] p-4 border">
        <div className="text-[24px]">Transaction</div>
        {cartData.items.map((data) => (
          <CheckoutItem
            quantity={data.quantity}
            size={data.size}
            price={data.price}
            id={data.id}
            name={data.name}
            coverImage={data.coverImage}
          />
        ))}
        <Divider className="bg-[#e5e5e5] mt-0" />
        <div className="flex justify-between pr-4">
          <div>Total Price:</div>
          <SalePrice salePrice={getTotalPrice(cartData.items)} />
        </div>
        <Divider className="bg-[#e5e5e5] mt-2" />
        <div className="flex justify-center">
          <button
            onClick={
              creataTransaction}
            className="w-full h-[50px]  border bg-baseColor text-[#FFFFFF]  duration-300"
          >
            <p>Payment on delivery</p>
          </button>
        </div>
        <div className="flex justify-center pt-4">
          <button className="w-full h-[50px] bg-[#22222299] border hover:bg-baseColor text-[#FFFFFF] duration-300"
            onClick={handleOnlinePayment}
          >
            <p>Payment by VNPay</p>
          </button>
        </div>
      </div>
    </div>
  )
}
