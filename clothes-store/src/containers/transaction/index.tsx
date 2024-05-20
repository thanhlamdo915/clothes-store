import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import transactionService from '../../service/transactionService'
import { Table, Select, message, Button } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { CreditCardTwoTone, MoneyCollectTwoTone } from '@ant-design/icons';
import { formatPrice } from '../../utilities/formatPrice';
import paymentService from '../../service/paymentService';

interface TransactionType {
  id: number;
  Product_Sizes: any;
  paymentStatus: number
  deliveryStatus: string;
  description: string;
  totalPrice: string;
  transactionMethod: string;
}

const { Option } = Select;




export const TransactionContainer = () => {
  const authData = useSelector((state: RootState) => state.auth)
  const userId = authData.user?.id;
  const [transData, setTransData] = useState<TransactionType[]>([]);

  const [filteredData, setFilteredData] = useState<TransactionType[]>();
  const handleDeliveryStatusFilter = (value: string) => {
    if (value === 'all') {
      setFilteredData(transData);
    } else {
      setFilteredData(transData.filter((transaction) => transaction.deliveryStatus === value));
    }
  }

  const handlePaymenMethodFilter = (value: string) => {
    if (value === 'all') {
      setFilteredData(transData);
    } else {
      setFilteredData(transData.filter((transaction) => transaction.transactionMethod === value));
    }
  }

  const handlePayAgain = async (id: number) => {
    const paymentData = {
      transactionId: id,
      bankCode: "VNBANK",
      language: "vn"
    }
    const result = await paymentService.createPaymentURL(paymentData);
    window.location.href = result.data.url;
  }
  const columns: ColumnType<TransactionType>[] = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      width: '25%',
      align: 'center',
      render: (_: any, record: TransactionType) => {
        return (
          <div>
            {
              record.Product_Sizes.map((data: any) => (
                <div className='flex'>
                  <img className=" w-[140px] aspect-[1/1] object-center" src={data.product?.coverImage} alt={data.product?.coverImage} />
                  <div className='flex-col pl-2 pt-2'>
                    <p>{data.product?.name}</p>
                    <p>{data.Transaction_Product_Size?.quantity} x {data.size?.name}</p>
                    {data.product?.salePrice ? <p>{formatPrice(data.product?.salePrice)}</p> : <p>{formatPrice(data.product?.price)}</p>}
                  </div>
                </div>
              ))
            }
          </div >
        )
      }
    },
    {
      title: 'Delivery status',
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
      align: 'center',
    },

    {
      title: 'Total price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'center',
      render: (_: any, record: any) => {
        return <div>
          <p>{formatPrice(record?.totalPrice)}</p>
        </div>
      }
    },
    {
      title: 'Transaction method',
      dataIndex: 'transactionMethod',
      key: 'transactionMethod',
      align: 'center',
      render: (_: any, record: any) => {
        return <>
          {record.transactionMethod
            === "vnpay" ? <p><CreditCardTwoTone /> VNPay </p> : <p><MoneyCollectTwoTone />Cash</p>}
        </>
      }
    },
    {
      title: 'Payment status',
      dataIndex: 'paymentstatus',
      key: 'paymentstatus',
      align: 'center',
      render: (_: any, record: any) => {
        return <>
          {record.paymentstatus
            === "0" ? <p>Not payment</p> : record.paymentstatus === "1" ? <p>Payment</p> : <p>Failure</p>}
          {(record.paymentstatus !== "1" && record.transactionMethod !== 'cash') && (
            <Button onClick={() => handlePayAgain(record.id)} className="mt-[1rem] bg-[#7F4227] text-[#FFFFFF]">
              Pay again
            </Button>
          )}
        </>
      }
    },
    {
      title: 'Note',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
    },
    {
      title: 'Action',
      dataIndex: 'cancel',
      key: 'cancel',
      align: 'center',
      render: (text: string, record: any) => {
        const handleCancelTransaction = async () => {
          try {
            const res = await transactionService.cancelTransaction(record.id)
            if (res.status === 200) {
              message.success("Your transaction has been canceled!");
              const updatedData = transData.map((transaction) => {
                if (transaction.id === record.id) {
                  return { ...transaction, deliveryStatus: 'canceled' };
                }
                return transaction;
              });
              setFilteredData(updatedData);
            }
          } catch (error) {
            console.log(error);
            message.warning('Can not cancel transaction')
          }
        };
        return (
          <Button disabled={record.deliveryStatus !== 'confirmming'} type="default" onClick={handleCancelTransaction} >
            Cancel
          </Button>
        );
      },
    },
  ];

  useEffect(() => {
    transactionService.getTransactionByUserId(userId!)
      .then((res) => {
        setTransData(res.data)
        setFilteredData(res.data)
      })
      .catch((err) => console.log(err))
  }, [userId])


  return <div>
    <div>
      <Select className='py-4' style={{ width: 200 }} defaultValue={'all'} onChange={handleDeliveryStatusFilter}>
        <Option value="all">All transaction</Option>
        <Option value="confirmming">Confirmming</Option>
        <Option value="init">Initialization</Option>
        <Option value="shipping">Shipping</Option>
        <Option value="received">Received</Option>
        <Option value="canceled">Canceled</Option>
      </Select>
      <Select className='py-4 pl-2' style={{ width: 200 }} defaultValue={'all'} onChange={handlePaymenMethodFilter}>
        <Option value="all">All payment</Option>
        <Option value="cash">By cash</Option>
        <Option value="vnpay">By VNPay</Option>
      </Select>
      <Table dataSource={filteredData} columns={columns} />
    </div>
  </div>
}
