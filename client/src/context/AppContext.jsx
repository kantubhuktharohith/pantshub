import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios"; 

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    const sellerToken = localStorage.getItem('sellerToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (sellerToken) {
        config.headers.sellerToken = sellerToken;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const AppContext = createContext();

export const AppContextProvider = ({children})=>{

    const currency = import.meta.env.VITE_CURRENCY;

    const navigate = useNavigate();
    const [user, setUser] = useState(null)
    const [isSeller, setIsSeller] = useState(false)
    const [showUserLogin, setShowUserLogin] = useState(false)
    const [products, setProducts] = useState([])
    const [cartItems, setCartItems] = useState({})
    const [searchQuery, setSearchQuery] = useState({})
    

    const fetchSeller = async ()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true)
            }else{
                setIsSeller(false)
            }
        } catch (error) {
            console.log('Seller auth check error:', error.message)
            setIsSeller(false)
        }
    }

    //fetch user auth status , user data and cart items

    const fetchUser = async ()=>{
        try {
            console.log('Frontend: Making auth check request...');
            const {data} = await axios.get('/api/user/is-auth');
            console.log('Frontend: Auth check response:', data);

            if(data.success){
                console.log('Frontend: User fetched successfully:', data.user);
                setUser(data.user)
                setCartItems(data.user.cartItems || {})
            } else {
                console.log('Frontend: Auth failed:', data.message);
                setUser(null)
                setCartItems({})
            }
        } catch (error) {
            console.log('Frontend: Auth check error:', error.response?.data || error.message)
            setUser(null)
            setCartItems({})
        }
    }


    //fetch products

    const fetchProducts = async ()=>{
        try {
            const { data } = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    const addToCart = async (itemId)=>{
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
        cartData[itemId] = 1;
        }
        setCartItems(cartData);
        toast.success("Add to Cart")
    }
    //update cart
    const updateCartItem = (itemId, quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData)
        toast.success("Cart Updated")
    }
    //remove productn from cart
    const removeFromCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0){
                delete cartData[itemId];
            }
        }
        toast.success("Removed from Cart")
        setCartItems(cartData)
    }
        //get cart items
        const getCartCount = ()=>{
            let totalCount = 0;
            for(const item in cartItems){
                totalCount += cartItems[item];
            }
            return totalCount;
        }
        //get cart total amount
        const getCartAmount = ()=>{
            let totalAmount = 0;
            for (const items in cartItems){
                let itemInfo = products.find((product)=> product._id === items);
                if(itemInfo && cartItems[items] > 0){
                    totalAmount += itemInfo.offerPrice * cartItems[items]
                }
            }
            return Math.floor(totalAmount * 100) / 100;
        }

        useEffect(()=>{
            fetchUser()
            fetchSeller()
            fetchProducts()
        },[])

        // Sync cart with backend when cart changes and user is logged in
        useEffect(()=>{
            if(user) {
                axios.post('/api/cart/update', {cartItems})
                .catch(err => console.log('Cart sync error:', err.message))
            }
        }, [cartItems, user])

    const value = {navigate, user, setUser, setIsSeller, isSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, updateCartItem, removeFromCart, cartItems, setCartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts, fetchUser, fetchSeller}

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}

