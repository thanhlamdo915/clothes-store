import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router';
import userService from '../../../service/admin-service/userService';
import { UserType } from './type';
import { Button, Modal, message } from 'antd';

export const UserDetailContainer = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState<UserType>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    handleDeleteUser();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleDeleteUser = () => {
    userService.deleteUser(userId!)
      .then((res) => {
        navigate('/admin/user')
        message.success('Delete user successfully')
      })
      .catch((err) => console.log(err))
  }
  useEffect(() => {
    userService.getUserDetails(userId!)
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err))
  }, [userId])
  return (
    <div className='bg-[#FFFFFF] flex-col mx-4 h-full'>
      <div className='flex'>
        <img className='h-[400px] w-[400px] m-4' src={userData?.avatar} alt='userImage' />
        <div className='m-4'>
          {
            userData &&
            Object.entries(userData!).map(([key, value]) => (
              key !== 'avatar' && key !== 'id' &&
              (<div className='flex m-4'>
                <div className='font-[500] capitalize mr-2'>{key}: </div>
                <div>{value}</div>
              </div>)
            ))
          }
        </div>
      </div>
      <Button danger className='m-4' onClick={showModal}>Delete User</Button>
      <Modal className='' open={isModalOpen} footer={null} okButtonProps={{ type: 'default' }}>
        <div className='p-4'>
          Do you want to delete this user
        </div>
        <div className='p-4 flex justify-end'>
          <Button onClick={handleCancel} className='mr-4'>Cancel</Button>
          <Button onClick={handleOk}>OK</Button>
        </div>
      </Modal>
    </div>
  )
}
