import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'

const trackingSteps = ['Order Placed', 'Shipped', 'Out for Delivery', 'Delivered'];

const OrderTracker = ({ status }) => {
    const currentStep = trackingSteps.indexOf(status);

    return (
        <div className="w-full mt-6 px-2">
            <div className="flex items-center justify-between relative">
                {/* Background line */}
                <div className="absolute top-[14px] left-[5%] right-[5%] h-[3px] bg-gray-200 z-0"></div>
                {/* Active line */}
                <div
                    className="absolute top-[14px] left-[5%] h-[3px] bg-primary z-0 transition-all duration-500"
                    style={{ width: `${Math.max(0, currentStep) * (90 / (trackingSteps.length - 1))}%` }}
                ></div>

                {trackingSteps.map((step, index) => (
                    <div key={step} className="flex flex-col items-center z-10 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                            index <= currentStep
                                ? 'bg-primary border-primary text-white'
                                : 'bg-white border-gray-300 text-gray-400'
                        }`}>
                            {index <= currentStep ? '✓' : index + 1}
                        </div>
                        <p className={`text-[10px] sm:text-[11px] mt-2 text-center leading-tight ${
                            index <= currentStep ? 'text-primary font-semibold' : 'text-gray-400'
                        }`}>
                            {step}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MyOrders = () => {
    const [myOrders, setMyOrders] = useState([])
    const {currency, axios, user} = useAppContext()

    const fetchMyOrders = async ()=>{
        try {
            const { data } = await axios.get('/api/order/user')
            if (data.success) {
                setMyOrders(data.orders)
            }
        } catch (error) {
            console.log(error);
        }
    }

    const cancelOrderHandler = async (order) => {
        try {
            const { data } = await axios.post('/api/order/cancel', { orderId: order._id })
            if (data.success) {
                if (order.paymentType === 'Online') {
                    toast.success("Order cancelled successfully. Your refund will be processed within 7 days.")
                } else {
                    toast.success(data.message)
                }
                fetchMyOrders()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(user){
            fetchMyOrders()
        }
    },[user])

    return (
    <div className='mt-16 pb-16'>
        <div className='flex flex-col items-end w-max mb-8'>
            <p className='text-2xl font-medium uppercase'>My orders</p>
            <div className='w-16 h-0.5 bg-primary rounded-full'></div>
        </div>
        {myOrders.map((order, index)=>(
            <div key={index} className='border border-gray-300 rounded-lg mb-10 p-4 py-5 max-w-4xl'>
                <p className='flex justify-between md:items-center text-gray-400 md:font-medium max-md:flex-col max-md:gap-1 text-sm'>
                    <span>OrderId : {order._id}</span>
                    <span>Name : {user?.name}</span>
                    <span>Payment : {order.paymentType}</span>
                    <span>Total Amount : {currency}{order.amount}</span>
                </p>
                {order.items.map((item, index)=>(
                    <div key={index} className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 && "border-b"} border-gray-300 flex flex-col md:flex-row md:items-center justify-betwwen p-4 py-5 md:gap-16 w-full max-w-4xl`}>
                        <div className='flex items-center mb-4 mb:mb-0'>
                            <div className='bg-primary/10 p-4 rounded-lg'>
                                <img src={item.product.image[0]} alt="" className='w-16 h-16' />
                            </div>
                            <div className='ml-4'>
                                <h2 className='text-xl font-medium text-gray-800'>{item.product.name}</h2>
                                <p>Category: {item.product.category}</p>
                            </div>
                        </div>
                        <div className='flex flex-col justify-center md:ml-30 mb-5 md:mb-4'>
                            <p>Quantity: {item.quantity || "1"}</p>
                            <p>Date: {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            <p>Time: {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                        </div>
                        <div  className='flex flex-col justify-center md:ml-30 mb-5 md:mb-4'>
                            <p className='text-primary text-lg font-medium'>
                            Amount: {currency}{item.product.offerPrice * item.quantity}
                        </p></div>
                    </div>
                ))}

                {/* Order Tracking */}
                {order.status === 'Cancelled' ? (
                    <div className='flex items-center gap-3 mt-4 px-4 py-3 bg-red-50 rounded-lg border border-red-200'>
                        <span className='text-red-500 text-lg'>✕</span>
                        <div>
                            <p className='text-red-600 font-semibold'>Order Cancelled</p>
                            {order.paymentType === 'Online' && (
                                <p className='text-red-400 text-sm'>Your refund will be processed within 7 days.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <OrderTracker status={order.status} />
                )}
                
                <div className='flex justify-end mt-4 px-4'>
                    {order.status === 'Order Placed' && (
                        <button onClick={() => cancelOrderHandler(order)} className='px-6 py-2 border border-red-500 text-red-500 rounded font-medium hover:bg-red-50 transition cursor-pointer'>
                            Cancel Order
                        </button>
                    )}
                </div>
            </div>
        ))}
    </div>
    )
}

export default MyOrders
