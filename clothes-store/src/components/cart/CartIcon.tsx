import { CloseOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { Drawer } from 'antd'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { ProductCart } from './ProductCart'
import { TProductCart } from './type'
import { formatPrice } from '../../utilities/formatPrice'

export const CartIcon = () => {
  const [open, setOpen] = useState(false)
  const carts = useSelector((state: RootState) => state.cart)

  const getTotalPrice = (items: TProductCart[]) => {
    let totalPrice = 0
    for (const item of items) {
      totalPrice += item.price * item.quantity
    }
    return totalPrice
  }

  const showDrawer = () => {
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  return (
    <div className="relative">
      <ShoppingCartOutlined
        onClick={() => showDrawer()}
        className="relative p-3 hover:text-baseColor cursor-pointer text-[28px]"
      />
      <p className="absolute top-[6px] right-[6px] w-[15px] h-[15px] text-[10px] flex justify-center items-center text-[#FFFFFF] bg-baseColor rounded-full">
        {carts.items.length}
      </p>
      <Drawer
        title={
          <div className="flex items-center">
            <span className="text-[20px]">SHOPPING CART({carts.items.length})</span>
            <CloseOutlined
              onClick={onClose}
              className="absolute right-4 cursor-pointer text-[#a4a4a4] hover:text-[#000000]"
            />
          </div>
        }
        closable={false}
        placement="right"
        onClose={onClose}
        open={open}
        rootClassName=""
      >
        <div className="">
          {carts.items.length === 0 ? (
            <div>
              <p>No product on the cart</p>
              <a href="/">Shop all product</a>
            </div>
          ) : (
            carts.items.map((cart) => <ProductCart productCartData={cart} />)
          )}
        </div>
        {carts.items.length > 0 && (
          <div>
            <div className="mt-6 text-[24px] flex">
              <div className="mr-2">Total Price:</div>
              <div className="text-baseColor">{formatPrice(getTotalPrice(carts.items))}đ</div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => (window.location.href = '/checkout')}
                className="w-full h-[50px] bg-white border  pl-[30px] pr-[30px] hover:bg-baseColor hover:text-[#FFFFFF]"
              >
                <p>Order now</p>
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
