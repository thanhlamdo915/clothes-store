import { formatPrice } from '../../utilities/formatPrice'

interface FixPriceFormatProps {
  price: number | undefined
  fontSize?: string
}
export const FixPriceFormat = (props: FixPriceFormatProps) => {
  const { price, fontSize } = props
  return (
    <span style={{ fontSize: fontSize }} className="text-[16px] flex justify-center line-through text-[#999999] pr-2">
      {formatPrice(price)}đ
    </span>
  )
}
