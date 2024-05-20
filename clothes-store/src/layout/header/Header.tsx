import { Link } from 'react-router-dom'
import { CartIcon } from '../../components/cart/CartIcon'

import { SearchIcon } from '../../components/search/SearchIcon'
import { LoginIcon } from '../../components/login/LoginIcon'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { useEffect, useState } from 'react'
import typeService from '../../service/typeService'
import { Dropdown } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems'
import { ProductType } from '../../containers/product/type'
const { getTypeTree } = typeService
type TypeTree = {
  id: number,
  name: string,
  menu: ItemType[],
}
const Header = () => {
  const { user, isLoggedIn } = useSelector((state: RootState) => state.auth)
  const [menu, setMenu] = useState<TypeTree[] | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  useEffect(() => {
    getTypeTree().then((res) => {
      const typeArray = res.data;

      const typeTree = typeArray.map((el: any) => {
        const catArrayes: CatArray[] = []
        el.big_categories.forEach((element: any, key: number) => {

          catArrayes.push({
            id: key,
            length: element.categories.length + 1
          })
        });
        const menuArray = arrangeMenu(catArrayes, 4).map((element: any) => element.map((element1: any) => el.big_categories[element1.id]))
        //@ts-ignore
        const alias = Object.keys(ProductType).find((type) => ProductType[type] === el.id.toString()) as string
        return {
          id: el.id,
          name: el.name,
          menu: menuCustom(menuArray, alias),
        }
      });
      setMenu(typeTree);
    })
  }, [])

  useEffect(() => {
    if (menu) {
      setIsLoading(false)
    }
  }, [menu])
  if (isLoading) return <></>
  return (
    <>
      <div className="flex-col bg-[#ffffff] sticky top-0 z-[1000]">
        <div className="h-[40px]  flex items-center justify-end  border-b border-[#ebebeb] pl-[8%] pr-[8%] bg-[#F4F4F4]">
          {isLoggedIn ? (
            <p className="text-[#111111] text-[14px] hover:text-black whitespace-nowrap ">Hello, {user?.name}</p>
          ) : (
            <p className="text-[#111111] text-[14px] hover:text-black whitespace-nowrap ">Welcome to clothes shop</p>
          )}
        </div>
        <div className="flex justify-between items-center h-[100px]  pl-[8%] pr-[8%] border-b border-[#ebebeb]">
          <a href="/" className="text-[44px] basis-[20%]  whitespace-nowrap text-baseColor font-bold-600">
            T - Fashion
          </a>
          <div className="flex">
            {!isLoading && menu?.map((el) => (
              // @ts-ignore
              <Dropdown
                menu={{
                  items: el.menu,
                  mode: 'inline'
                }}
                className="p-4 text-[20px] flex items-center justify-center hover:text-baseColor uppercase"
                overlayStyle={{ width: '100%', zIndex: 0 }}
                overlayClassName="navbar-dropdown"
              >
                {/* @ts-ignore */}
                <a href={`/${Object.keys(ProductType).find((type) => ProductType[type] === el.id.toString())}`}>
                  {el.name}
                </a>
              </Dropdown>

            ))}

            {/* <a href={'/men'} className="p-4 flex items-center justify-center hover:text-baseColor uppercase">
            Nam
          </a>
          <a href={'/women'} className="p-4 flex items-center justify-center hover:text-baseColor uppercase">
            Nữ
          </a>
          <a href={'/kids'} className="p-4 flex items-center justify-center hover:text-baseColor uppercase">
            Trẻ em
          </a> */}
          </div>
          <div className="flex">
            <SearchIcon />
            <LoginIcon />
            <CartIcon />
          </div>
        </div >
      </div >
      <style>{
        `.ant-dropdown.navbar-dropdown .ant-dropdown-menu, :where(.css-dev-only-do-not-override-5831jo).ant-dropdown-menu-submenu .ant-dropdown-menu {
          display: flex !important;
          flex-direction: row !important;
          justify-content: center !important;
          padding-bottom: 2.5rem !important;
          padding-top: 1.5rem !important;
          padding-left: 3rem !important;
          padding-right: 3rem !important;
  
        }
        .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item-group{
          margin-right:1rem !important;
        }
        .ant-dropdown .ant-dropdown-menu .ant-dropdown-menu-item-group-list{
          margin-right:1rem !important;
          margin: 0 !important;
        }
        `}
      </style>
    </>
  )
}
type CatArray = {
  id: number,
  length: number
}
export default Header
function arrangeMenu(catArrayes: CatArray[], rows: number): CatArray[][] {

  catArrayes.sort((a, b) => b.length - a.length);

  const length: number[] = new Array(rows).fill(0);
  const rowsData: CatArray[][] = new Array(rows).fill(null).map(() => []);

  for (const catArray of catArrayes) {
    const minIndex = length.indexOf(Math.min(...length));
    rowsData[minIndex].push(catArray);
    length[minIndex] += catArray.length;
  }
  return rowsData;
}
const menuCustom = (array: any, rootName: string): ItemType[] => {
  return array.map((element: any, key: number) => ({
    type: 'group',
    children:
      element.map((element1: any) => ({
        type: 'group',
        label: (<span className='!text-[#000000]'><p className='font-[500]'>{element1.name?.toString().toUpperCase()}</p></span>),
        children:
          element1.categories.map((element2: any) => ({
            label: (<a className='' href={`/${rootName.toLowerCase()}?id=${element1.id}-${element2.id}`}>{element2.name}</a>),
            key: `${element2.id}`,
          }))
      }))
  })
  )
}
