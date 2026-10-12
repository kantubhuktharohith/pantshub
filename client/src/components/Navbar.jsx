import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
    const [open, setOpen] = React.useState(false)
    const [showProfileMenu, setShowProfileMenu] = React.useState(false)
    const [showMobileSearch, setShowMobileSearch] = React.useState(false)
    const profileRef = useRef(null)
    const mobileProfileRef = useRef(null)
    const {user, setUser, setShowUserLogin, navigate, setSearchQuery, searchQuery, getCartCount, axios, setCartItems} = useAppContext();
    
    const logout = async ()=>{
        try {
            await axios.get('/api/user/logout');
            localStorage.removeItem('token');
            setUser(null);
            setCartItems({});
            navigate('/')
        } catch (error) {
            console.log('Logout error:', error.message)
        }
    }

    useEffect(()=>{
        if(searchQuery.length > 0){
            navigate("/product")
        }
    },[searchQuery])

    // Close profile menu on outside click/tap
    useEffect(() => {
        const handleClickOutside = (e) => {
            const isInsideDesktop = profileRef.current && profileRef.current.contains(e.target)
            const isInsideMobile = mobileProfileRef.current && mobileProfileRef.current.contains(e.target)
            if (!isInsideDesktop && !isInsideMobile) {
                setShowProfileMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
        }
    }, [])

    // Close mobile menu when navigating
    const handleNavClick = () => {
        setOpen(false)
        setShowMobileSearch(false)
    }

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all">
            <NavLink to='/' onClick={handleNavClick}>
                <img className="h-9" src={assets.logo} alt="logo"/>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-8">
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/product'>All Product</NavLink>
                <NavLink to='/'>Contact</NavLink>
                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                    <input onChange={(e)=> setSearchQuery(e.target.value)} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
                    <img src={assets.search_icon} alt='search' className='w-4 h-4'/>
                </div>

                <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
                    <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>

                {!user ? (
                    <button onClick={()=> setShowUserLogin(true)} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">
                        Login
                    </button>
                ) : (
                    <div className='relative' ref={profileRef}>
                        <img 
                            src={assets.profile_icon} 
                            className='w-10 cursor-pointer' 
                            alt="profile" 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        />
                        {showProfileMenu && (
                            <ul className='absolute top-12 right-0 bg-white shadow-lg border border-gray-200 py-2.5 w-36 rounded-md text-sm z-40'>
                                <li onClick={()=> {navigate("/profile"); setShowProfileMenu(false)}} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>My Profile</li>
                                <li onClick={()=> {navigate("my-orders"); setShowProfileMenu(false)}} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>My Orders</li>
                                <li onClick={()=> {logout(); setShowProfileMenu(false)}} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>Logout</li>
                            </ul>
                        )}
                    </div>
                )}
            </div>

            {/* Mobile Header Icons */}
            <div className='flex items-center gap-3 sm:hidden'>
                {/* Mobile Search Toggle */}
                <button onClick={() => {setShowMobileSearch(!showMobileSearch); setOpen(false)}} className="p-1.5" aria-label="Search">
                    <img src={assets.search_icon} alt='search' className='w-5 h-5 opacity-70'/>
                </button>

                {!user ? (
                    <button onClick={()=> setShowUserLogin(true)} className="cursor-pointer px-4 py-1.5 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
                        Login
                    </button>
                ) : (
                    <div className='relative' ref={mobileProfileRef}>
                        <img 
                            src={assets.profile_icon} 
                            className='w-8 cursor-pointer' 
                            alt="profile" 
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        />
                        {showProfileMenu && (
                            <ul className='absolute top-10 right-0 bg-white shadow-lg border border-gray-200 py-2.5 w-36 rounded-md text-sm z-40'>
                                <li onClick={()=> {navigate("/profile"); setShowProfileMenu(false)}} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>My Profile</li>
                                <li onClick={()=> {navigate("my-orders"); setShowProfileMenu(false)}} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>My Orders</li>
                                <li onClick={()=> {logout(); setShowProfileMenu(false)}} className='p-2 pl-4 hover:bg-primary/10 cursor-pointer'>Logout</li>
                            </ul>
                        )}
                    </div>
                )}

                <div onClick={()=> navigate("/cart")} className="relative cursor-pointer">
                    <img src={assets.nav_cart_icon} alt='cart' className='w-6 opacity-80'/>
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{getCartCount()}</button>
                </div>

                <button onClick={() => {open ? setOpen(false) : setOpen(true); setShowMobileSearch(false)}} aria-label="Menu">
                    <img src={assets.menu_icon} alt='menu'/>
                </button>
            </div>

            {/* Mobile Search Bar */}
            {showMobileSearch && (
                <div className="absolute top-[60px] left-0 w-full bg-white shadow-md px-5 py-3 z-50 mobile-menu-enter sm:hidden">
                    <div className="flex items-center gap-2 border border-gray-300 px-3 rounded-full">
                        <input 
                            onChange={(e)=> setSearchQuery(e.target.value)} 
                            className="py-2 w-full bg-transparent outline-none placeholder-gray-500 text-sm" 
                            type="text" 
                            placeholder="Search products..." 
                            autoFocus
                        />
                        <img src={assets.search_icon} alt='search' className='w-4 h-4'/>
                    </div>
                </div>
            )}
            
            {/* Mobile Menu Backdrop */}
            {open && (
                <div 
                    className="fixed inset-0 bg-black/30 z-40 sm:hidden backdrop-overlay" 
                    onClick={() => setOpen(false)}
                    style={{ top: '60px' }}
                />
            )}

            {/* Mobile Menu */}
            {open && (
                <div className="absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-3 px-5 text-sm z-50 mobile-menu-enter sm:hidden">
                    <NavLink to="/" onClick={handleNavClick} className="w-full py-2 border-b border-gray-100">Home</NavLink>
                    <NavLink to="/product" onClick={handleNavClick} className="w-full py-2 border-b border-gray-100">All Product</NavLink>
                    {user && (
                        <NavLink to="/my-orders" onClick={handleNavClick} className="w-full py-2 border-b border-gray-100">My Orders</NavLink>
                    )}
                    <NavLink to="/" onClick={handleNavClick} className="w-full py-2 border-b border-gray-100">Contact</NavLink>
                    {!user ? (
                        <button onClick={()=>{
                            handleNavClick();
                            setShowUserLogin(true);
                        }} className="cursor-pointer px-6 py-2.5 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm w-full text-center">
                            Login
                        </button>
                    ) : (
                        <button onClick={() => {logout(); handleNavClick()}} className="cursor-pointer px-6 py-2.5 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm w-full text-center">
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar
