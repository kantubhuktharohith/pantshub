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
    const addToCart = async (itemId, size = null, quantity = 1)=>{
        let cartData = structuredClone(cartItems);
        const key = size ? `${itemId}__${size}` : itemId;

        if(cartData[key]){
            cartData[key] += quantity;
        }else{
            cartData[key] = quantity;
        }
        setCartItems(cartData);
        toast.success("Added to Cart")
    }

    // Add multiple sizes and pieces in one go (wholesale bulk ordering)
    const addMultipleToCart = async (itemsList)=>{
        let cartData = structuredClone(cartItems);
        let totalPieces = 0;
        let count = 0;

        for (const item of itemsList) {
            const qty = Number(item.quantity) || 0;
            if (qty > 0) {
                const key = item.size ? `${item.itemId}__${item.size}` : item.itemId;
                if (cartData[key]) {
                    cartData[key] += qty;
                } else {
                    cartData[key] = qty;
                }
                totalPieces += qty;
                count++;
            }
        }
        setCartItems(cartData);
        toast.success(`Added ${totalPieces} pieces (${count} sizes) to Cart!`);
    }

    //update cart item quantity
    const updateCartItem = (key, quantity)=>{
        let cartData = structuredClone(cartItems);
        if (quantity <= 0) {
            delete cartData[key];
            toast.success("Removed from Cart");
        } else {
            cartData[key] = quantity;
            toast.success("Cart Updated");
        }
        setCartItems(cartData)
    }

    //delete single item completely from cart
    const deleteCartItem = (key)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[key] !== undefined){
            delete cartData[key];
            setCartItems(cartData);
            toast.success("Removed from Cart");
        }
    }

    //remove product piece from cart
    const removeFromCart = (key)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[key]){
            cartData[key] -= 1;
            if(cartData[key] === 0){
                delete cartData[key];
            }
            toast.success("Removed from Cart")
            setCartItems(cartData)
        }
    }

    //get cart items total count
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
        for (const key in cartItems){
            const productId = key.includes('__') ? key.split('__')[0] : key;
            let itemInfo = products.find((product)=> product._id === productId);
            if(itemInfo && cartItems[key] > 0){
                totalAmount += itemInfo.offerPrice * cartItems[key]
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

    const value = {navigate, user, setUser, setIsSeller, isSeller, showUserLogin, setShowUserLogin, products, currency, addToCart, addMultipleToCart, updateCartItem, removeFromCart, deleteCartItem, cartItems, setCartItems, searchQuery, setSearchQuery, getCartAmount, getCartCount, axios, fetchProducts, fetchUser, fetchSeller}

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export const useAppContext = ()=>{
    return useContext(AppContext)
}

