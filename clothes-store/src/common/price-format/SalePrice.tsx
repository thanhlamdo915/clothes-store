import { formatPrice } from '../../utilities/formatPrice'

interface FixPriceFormatProps {
  salePrice?: number | undefined
  fontSize?: string
}
export const SalePrice = (props: FixPriceFormatProps) => {
  const { salePrice, fontSize } = props
  return (
    <span style={{ fontSize: fontSize }} className="text-[16px] flex justify-center text-baseColor">
      {formatPrice(salePrice)}đ
    </span>
  )
}
