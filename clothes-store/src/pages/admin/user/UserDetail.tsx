import { Helmet } from 'react-helmet'
import { UserDetailContainer } from '../../../containers/admin/user/UserDetail'

export const AdminUserDetailManagement = () => {
  return (
    <div className="">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home page</title>
      </Helmet>
      <div>
        <UserDetailContainer />
      </div>
    </div>
  )
}
