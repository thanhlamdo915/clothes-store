import { Button, Input, Select, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import userService from '../../../service/admin-service/userService';
import { UserType } from './type';
import { ColumnType } from 'antd/es/table';
import { Link } from 'react-router-dom';

const { Option } = Select;

export const UserManagementContainer = () => {
  const [inputSearch, setInputSearch] = useState('');
  const [option, setOption] = useState<string>('name');
  const [userData, setUserData] = useState<UserType[]>();
  const [filteredData, setFilteredData] = useState<UserType[]>();
  const handleSearchNameInput = (value: string) => {
    if (value === 'all') {
      setFilteredData(userData);
    } else if (value === 'name') {
      setFilteredData(userData!.filter((user) => user.name.toLowerCase().includes(inputSearch.toLowerCase())));
    } else if (value === 'phone') {
      setFilteredData(userData!.filter((user) => user.phone.toLowerCase().includes(inputSearch.toLowerCase())));
    } else if (value === 'email') {
      setFilteredData(userData!.filter((user) => user.email.toLowerCase().includes(inputSearch.toLowerCase())));
    }
  }
  const columns: ColumnType<UserType>[] = [
    {
      title: 'No',
      dataIndex: 'id',
      key: 'id',
      render: (value: any, record: UserType, index: number) => <div>{index + 1}</div>
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_: any, record: UserType) => {
        return (
          <a href={`user/${record.id}`}>{record.name}</a>
        )
      }
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
  ];
  useEffect(() => {
    userService.getAllUser()
      .then((res) => {
        setUserData(res.data);
        setFilteredData(res.data);
      })
      .catch((err) => console.log(err))
  }, [])
  return (
    <div>
      <Input onChange={(e) => setInputSearch(e.target.value)} value={inputSearch} placeholder='Find by ...' className='w-[300px] ml-2' />
      <Select className='' style={{ width: 150 }} defaultValue={'name'} onChange={(e) => setOption(e)}>
        <Option value="all">All</Option>
        <Option value="name">Name</Option>
        <Option value="phone">Phone number</Option>
        <Option value="email">Email</Option>
      </Select>
      <Button onClick={() => handleSearchNameInput(option!)}>Find</Button>
      <Table dataSource={filteredData} columns={columns} />
    </div>
  )
}
