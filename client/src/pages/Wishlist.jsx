import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
    const { products, navigate } = useAppContext();
    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistIds(stored);
    }, []);

    // Listen for storage changes (from ProductDetails toggling wishlist)
    useEffect(() => {
        const handleStorage = () => {
            const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
            setWishlistIds(stored);
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const wishlistProducts = products.filter(p => wishlistIds.includes(p._id));

    const removeFromWishlist = (productId) => {
        const updated = wishlistIds.filter(id => id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(updated));
        setWishlistIds(updated);
    };

    const clearWishlist = () => {
        localStorage.setItem('wishlist', JSON.stringify([]));
        setWishlistIds([]);
    };

    return (
        <div className="mt-8 mb-16">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-medium text-gray-800">My Wishlist</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
                {wishlistProducts.length > 0 && (
                    <button
                        onClick={clearWishlist}
                        className="text-sm text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer hover:bg-red-50"
                    >
                        Clear All
                    </button>
                )}
            </div>

            {wishlistProducts.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-12 h-12 text-red-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-medium text-gray-700 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-6 max-w-sm">
                        Tap the heart icon on any product to save it here for later.
                    </p>
                    <button
                        onClick={() => { navigate('/product'); scrollTo(0, 0); }}
                        className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dull transition-all duration-300 cursor-pointer font-medium"
                    >
                        Browse Products
                    </button>
                </div>
            ) : (
                /* Wishlist Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {wishlistProducts.map((product) => (
                        <div key={product._id} className="relative group">
                            <ProductCard product={product} />
                            {/* Remove from wishlist button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromWishlist(product._id);
                                }}
                                className="absolute top-3 right-3 md:top-5 md:right-5 p-1.5 rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-red-50 hover:border-red-300 transition-all duration-300 cursor-pointer z-10 opacity-0 group-hover:opacity-100"
                                title="Remove from wishlist"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 text-red-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
