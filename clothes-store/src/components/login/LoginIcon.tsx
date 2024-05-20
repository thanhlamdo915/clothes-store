import { UserOutlined } from '@ant-design/icons'
import { Input, message, Modal } from 'antd'
import { useState } from 'react'
import LoginBanner from '../../assets/login/sign-in.jpg'
import { Dropdown } from 'antd'
import { MenuProps } from 'antd'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { authService } from '../../service/authService'
import { login, logout } from '../../redux/slice/authSlice'
import { useNavigate } from 'react-router'
import instance from '../../auth'

export const LoginIcon = () => {
  const isLogin = useSelector((state: RootState) => state.auth.isLoggedIn)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const dispatch = useDispatch()

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    setError
  } = useForm()
  const navigate = useNavigate()

  const handleSignout = () => {
    dispatch(logout())
    navigate('/')
  }

  const items: MenuProps['items'] = [
    {
      label: <div onClick={() => navigate('/account/profile')}>My Account</div>,
      key: '1',
    },
    {
      type: 'divider',
    },
    {
      label: <div onClick={() => navigate('/account/transaction')}>Order Tracking</div>,
      key: '2',
    },
    {
      type: 'divider',
    },
    {
      label: <div onClick={handleSignout}>Sign out</div>,
      key: '3',
    },
  ]

  const showModal = () => {
    if (!isLogin) {
      setIsModalOpen(true)
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const onSubmit = async () => {
    const data = getValues()
    try {
      authService
        .login({ email: data.email, password: data.password, role: 'user' })
        .then((res: any) => {
          dispatch(login(res.data))
          console.log(res)
          instance.setToken(res.data.token);
          console.log(instance.defaults);
          message.success('Login successfully')
          setIsModalOpen(false)
        })
        .catch((err: any) => {
          console.log(err)
          setError("root", { type: "custom", message: "Invalid credential" })
        })
    } catch (error) { }
  }

  return (
    <div className="relative">
      <Dropdown overlayStyle={{ width: '160px' }} disabled={!isLogin} menu={{ items }} placement="bottomRight">
        <UserOutlined onClick={() => showModal()} className=" p-3 hover:text-baseColor cursor-pointer text-[28px]" />
      </Dropdown>

      <div className="absolute left-0 w-[200px]">
        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          okButtonProps={{ hidden: true }}
          cancelButtonProps={{ hidden: true }}
        >
          <img width={'100%'} src={LoginBanner} alt="login"></img>
          <div className="h-[400px]">
            <div className="flex-col p-[40px] ">
              <Controller
                control={control}
                name="email"
                rules={{
                  pattern: {
                    value:
                      //eslint-disable-next-line
                      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i,
                    message: 'Invalid email',
                  },
                  minLength: {
                    value: 3,
                    message: 'Email must be at least 3 characters',
                  },
                }}
                render={({ field: { value, onChange } }) => (
                  <Input
                    style={{ height: '50px' }}
                    size="large"
                    placeholder="Email*"
                    className="mb-4"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <Input.Password
                    style={{ height: '50px' }}
                    size="large"
                    placeholder="Password*"
                    type="password"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              <p className="mt-[17px] mb-[30px] alert">
                {errors.root?.message}
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit(onSubmit)}
                  className="w-full h-[50px] bg-[#222222] border hover:bg-baseColor text-[#FFFFFF]  duration-300"
                >
                  <p>SIGN IN</p>
                </button>
              </div>
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => (window.location.href = '/register')}
                  className="w-full h-[50px] bg-[#22222299] border hover:bg-baseColor text-[#FFFFFF] duration-300"
                >
                  <p>CREATE ACOUNT</p>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}
