import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets, dummyAddress } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
    const { products, currency, cartItems, removeFromCart, deleteCartItem, getCartCount, updateCartItem, navigate, getCartAmount, axios, user, setCartItems } = useAppContext()
    const [cartArray, setCartArray] = useState([])
    const [addresses, setAddresses] = useState([])
    const [showAddress, setShowAddress] = useState(false)
    const [selectedAddress, setSelectedAddress] = useState(null)
    const [paymentOption, setPaymentOption] = useState("COD")
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)

    const getCart = () => {
        let tempArray = []
        for (const key in cartItems) {
            const [productId, size] = key.includes('__') ? key.split('__') : [key, null]
            const product = products.find((item) => item._id === productId)
            if (product && cartItems[key] > 0) {
                tempArray.push({
                    ...product,
                    cartKey: key,
                    size: size || null,
                    quantity: cartItems[key]
                })
            }
        }
        setCartArray(tempArray)
    }

    const getAddresses = async () => {
        try {
            const { data } = await axios.get('/api/address/get')
            if (data.success) {
                setAddresses(data.addresses)
                if (data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0])
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const placeOrder = async () => {
        if (isPlacingOrder) return;
        setIsPlacingOrder(true);
        try {
            if (!selectedAddress) {
                setIsPlacingOrder(false);
                return toast.error("Please select an address")
            }

            //Place order for cod
            if (paymentOption === "COD") {
                const { data } = await axios.post('/api/order/cod', {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id
                })
                if (data.success) {
                    toast.success(data.message)
                    setCartItems({})
                    navigate('/my-orders')

                } else {
                    toast.error(data.message)
                }
            }else{
                //Place order for online payment
                const { data } = await axios.post('/api/order/stripe', {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id,
                    origin: window.location.origin
                })
                if(data.success){
                    window.location.replace(data.url)
                }else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsPlacingOrder(false);
        }
    }

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart()
        }
    }, [products, cartItems])

    useEffect(() => {
        if (user) {
            getAddresses()

        }
    }, [user])


    return products.length > 0 && cartItems ? (
        <div className="flex flex-col md:flex-row mt-16 gap-6 md:gap-0">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{getCartCount()} Pieces</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-sm md:text-base font-medium pb-3 border-b border-gray-200">
                    <p className="text-left">Product & Size Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium py-3 border-b border-gray-100">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={() => {
                                navigate(`/product/${product.category.toLowerCase()}/${product._id}`); scrollTo(0, 0)
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded shrink-0 bg-white">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="font-semibold text-sm md:text-base line-clamp-2 text-gray-800">{product.name}</p>
                                <div className="font-normal text-gray-500/70 mt-1">
                                    {product.size && (
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-primary text-white">
                                                Size: {product.size}
                                            </span>
                                            <span className="text-xs text-gray-400">Wholesale pant</span>
                                        </div>
                                    )}
                                    <div className='flex items-center gap-2'>
                                        <p className="text-xs md:text-sm font-medium text-gray-700">Pieces:</p>
                                        <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden shadow-xs">
                                            <button
                                                onClick={() => updateCartItem(product.cartKey, Math.max(1, product.quantity - 1))}
                                                className="px-2.5 py-1 hover:bg-gray-100 text-gray-700 font-bold transition text-xs"
                                                title="Decrease 1 piece"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={product.quantity}
                                                onChange={e => updateCartItem(product.cartKey, Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-14 text-center text-gray-800 font-semibold outline-none text-xs md:text-sm py-0.5"
                                            />
                                            <button
                                                onClick={() => updateCartItem(product.cartKey, product.quantity + 1)}
                                                className="px-2.5 py-1 hover:bg-gray-100 text-gray-700 font-bold transition text-xs"
                                                title="Increase 1 piece"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-400">@ {currency}{product.offerPrice}/pc</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center font-semibold text-gray-800">{currency}{product.offerPrice * product.quantity}</p>
                        <button onClick={() => deleteCartItem ? deleteCartItem(product.cartKey) : removeFromCart(product.cartKey)} className="cursor-pointer mx-auto p-2 hover:bg-red-50 rounded-full transition" title="Remove size item">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-5 h-5" />
                        </button>
                    </div>)
                )}

                <button onClick={() => { navigate("/product"); scrollTo(0, 0) }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img className="group-hover:-translate-x-1 transition" src={assets.arrow_right_icon_colored} alt="arrow" />
                    Continue Shopping
                </button>

            </div>

            <div className="md:max-w-[360px] w-full bg-gray-100/40 p-5 border border-gray-300/70 rounded-md">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` : "No address found"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                                {addresses.map((address, index) => (<p onClick={() => { setSelectedAddress(address); setShowAddress(false) }} className="text-gray-500 p-2 hover:bg-gray-100">
                                    {address.street}, {address.city}, {address.state}, {address.country}
                                </p>))}
                                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select onChange={e => setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{getCartAmount()}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{getCartAmount() * 2 / 100}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>
                            {currency}{getCartAmount() + getCartAmount() * 2 / 100}</span>
                    </p>
                </div>

                <button onClick={placeOrder} disabled={isPlacingOrder} className={`w-full py-3 mt-6 cursor-pointer text-white font-medium transition ${isPlacingOrder ? 'bg-gray-400' : 'bg-primary hover:bg-primary-dull'}`}>
                    {isPlacingOrder ? "Placing Order..." : (paymentOption === "COD" ? "Place Order" : "Proceed to Checkout")}
                </button>
            </div>
        </div>
    ) : null
}

export default Cart;