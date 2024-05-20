import { useNavigate } from 'react-router-dom'
import { ProductData } from '../../containers/product/type'
import { FixPriceFormat } from '../../common/price-format/FixPrice'
import { SalePrice } from '../../common/price-format/SalePrice'
import { useDispatch } from 'react-redux'
import { addToRecently } from '../../redux/slice/recentlySlice'

const ProductItem = ({ coverImage, name, price, id, salePrice }: ProductData) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  return (
    <div
      onClick={() => {
        navigate(`/product/${id.toString()}`)
        dispatch(addToRecently({ id, coverImage, name, price, salePrice }))
      }}
      className="flex-col mr-5 ml-5 mt-8 justify-center items-center cursor-pointer"
    >
      <div className="relative">
        <img src={coverImage} alt={name} className="rounded-t-lg w-[240px] aspect-[1/1] object-center" />
        {salePrice < price ? (
          <div className="absolute bg-[#FFFFFF] text-baseColor border top-3 left-3 px-2">
            -{Math.round((1 - salePrice / price) * 100)}%
          </div>
        ) : null}
      </div>
      <p className="flex justify-center pt-2">{name}</p>
      {salePrice < price ? (
        <div className="flex justify-center text-[14px] ">
          <FixPriceFormat price={price} />
          <SalePrice salePrice={salePrice} />
        </div>
      ) : (
        <SalePrice salePrice={price} />
      )}
    </div>
  )
}

export default ProductItem
