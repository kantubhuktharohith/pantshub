import React, { useEffect, useState } from 'react'
import { useAppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import toast from 'react-hot-toast'

const Orders = () => {
    const {currency, axios} = useAppContext()
    const [orders, setOrders] = useState([])

    const fetchOrders = async () =>{
        try {
            const { data } = await axios.get('/api/order/seller')
            if (data.success) {
                setOrders(data.orders)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    };

    const statusHandler = async (e, orderId) => {
        try {
            const { data } = await axios.post('/api/order/status', { orderId, status: e.target.value })
            if (data.success) {
                toast.success(data.message)
                fetchOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        fetchOrders();
    },[])

    return (
        <div className='no-scrollbar flex-1 h-[95vh] overflow-y-scroll'>
    <div className="md:p-10 p-4 space-y-4">
            <h2 className="text-lg font-medium">Orders List</h2>
            {orders?.map((order, index) => (
                <div key={index} className="flex flex-col md:items-center md:flex-row gap-4 md:gap-5 justify-between p-4 md:p-5 max-w-4xl rounded-md border border-gray-300">
                    <div className="flex gap-5 max-w-80">
                        <img className="w-12 h-12 object-cover" src={assets.box_icon} alt="boxIcon" />
                        <div>
                            {order.items?.map((item, index) => (
                                <div key={index} className="flex flex-col">
                                    <p className="font-medium">
                                        {item.product?.name || "Unknown Product"}{" "} <span className="text-primary">x {item.quantity}</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm md:text-base text-black/60">
                        <p className='font-medium text-black/80'>Orderd By: {order.userId?.name}</p>
                        <p>{order.address?.street}, {order.address?.city}</p> 
                        <p>{order.address?.state},{order.address?.zipcode}, {order.address?.country}</p>
                        <p></p>
                        <p>{order.address?.phone}</p>
                    </div>

                    <p className="font-medium text-lg my-auto">{currency}{order.amount}</p>

                    <div className="flex flex-col text-sm md:text-base text-black/60">
                        <p>Method: {order.paymentType}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                        {order.status === "Cancelled" ? (
                            <p className="font-medium text-red-500 mt-2">Cancelled</p>
                        ) : (
                            <select onChange={(e) => statusHandler(e, order._id)} value={order.status} className="border border-gray-300 p-1 rounded mt-1 bg-white cursor-pointer outline-primary text-gray-700">
                                <option value="Order Placed">Order Placed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                            </select>
                        )}
                    </div>
                </div>
            ))}
        </div>
        </div>
    )
}

export default Orders
