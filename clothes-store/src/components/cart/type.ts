export type TProductCart = {
  id: number
  name: string
  coverImage: string
  quantity: number
  price: number
  size: {
    name: string
    id: number
  }
}
