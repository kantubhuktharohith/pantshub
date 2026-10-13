import { useEffect, useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import toast from 'react-hot-toast';
import { Link,useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {

    const {products, navigate, currency, addToCart, addMultipleToCart, axios, fetchProducts, user} = useAppContext()
    const {id} = useParams()
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [showSizeChart, setShowSizeChart] = useState(false);
    const shareMenuRef = useRef(null);

    const sizes = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

    const sizeDetails = {
        'S': { waist: '28-30"', hip: '38"', length: '39"', inseam: '29"' },
        'M': { waist: '31-33"', hip: '40"', length: '40"', inseam: '30"' },
        'L': { waist: '34-36"', hip: '42"', length: '41"', inseam: '30"' },
        'XL': { waist: '37-39"', hip: '44"', length: '41"', inseam: '31"' },
        'XXL': { waist: '40-42"', hip: '46"', length: '42"', inseam: '31"' },
        '3XL': { waist: '43-45"', hip: '48"', length: '42"', inseam: '31"' },
    };

    // Wholesale state: selected sizes and pieces per size
    const [selectedSizes, setSelectedSizes] = useState(['S', 'M', 'L', 'XL', 'XXL', '3XL']);
    const [sizePieces, setSizePieces] = useState({
        'S': 10,
        'M': 10,
        'L': 10,
        'XL': 10,
        'XXL': 10,
        '3XL': 10,
    });
    const [bulkQty, setBulkQty] = useState(10);

    const product = products.find((item)=> item._id === id);

    const submitReview = async () => {
        if (!user) {
            toast.error("Please login to write a review");
            return;
        }
        if (rating === 0 || comment.trim() === "") {
            toast.error("Please provide both a rating and a comment");
            return;
        }
        try {
            const { data } = await axios.post('/api/product/review', { productId: product._id, rating, comment });
            if (data.success) {
                toast.success(data.message);
                setRating(0);
                setComment("");
                fetchProducts();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const totalReviews = product?.reviews?.length || 0;
    const averageRating = totalReviews > 0 
        ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
        : 0;

    useEffect(()=>{
        if(products.length > 0){
            let productsCopy = products.slice();
            productsCopy = productsCopy.filter((item)=> product.category === item.category)
            setRelatedProducts(productsCopy.slice(0,5))
        }
    },[product])
    useEffect(()=>{
        setThumbnail(product?.image[0] ? product.image[0] : null)
    },[product])

    // Wishlist persistence
    useEffect(() => {
        if (product) {
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            setIsWishlisted(wishlist.includes(product._id));
        }
    }, [product]);

    // Close share menu on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
                setShowShareMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleWishlist = () => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (isWishlisted) {
            const updated = wishlist.filter(id => id !== product._id);
            localStorage.setItem('wishlist', JSON.stringify(updated));
            setIsWishlisted(false);
            toast.success('Removed from wishlist');
        } else {
            wishlist.push(product._id);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            setIsWishlisted(true);
            toast.success('Added to wishlist');
        }
    };

    const productUrl = window.location.href;

    const shareActions = [
        {
            name: 'Copy Link',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                </svg>
            ),
            action: () => {
                navigator.clipboard.writeText(productUrl);
                toast.success('Link copied to clipboard!');
                setShowShareMenu(false);
            }
        },
        {
            name: 'WhatsApp',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            ),
            action: () => {
                window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + productUrl)}`, '_blank');
                setShowShareMenu(false);
            }
        },
        {
            name: 'Twitter',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
            ),
            action: () => {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(productUrl)}`, '_blank');
                setShowShareMenu(false);
            }
        },
        {
            name: 'Facebook',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            ),
            action: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
                setShowShareMenu(false);
            }
        }
    ];

    return product && (
        <div className="mt-12">
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 mt-4">
                <div className="flex flex-col-reverse md:flex-row gap-3">
                    <div className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar">
                        {product.image.map((image, index) => (
                            <div key={index} onClick={() => setThumbnail(image)} className="border min-w-20 max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer" >
                                <img src={image} alt={`Thumbnail ${index + 1}`} />
                            </div>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 max-w-full md:max-w-100 rounded overflow-hidden">
                        <img src={thumbnail} alt="Selected product" className="w-full h-full object-cover" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <div className="flex items-start justify-between gap-4">
                        <h1 className="text-3xl font-medium">{product.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            {/* Wishlist Button */}
                            <button
                                onClick={toggleWishlist}
                                className="p-2 rounded-full border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all duration-300 cursor-pointer group"
                                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`w-5 h-5 transition-all duration-300 ${
                                        isWishlisted
                                            ? 'fill-red-500 stroke-red-500 scale-110'
                                            : 'fill-none stroke-gray-500 group-hover:stroke-red-400'
                                    }`}
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                                    />
                                </svg>
                            </button>

                            {/* Share Button */}
                            <div className="relative" ref={shareMenuRef}>
                                <button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="p-2 rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 cursor-pointer group"
                                    title="Share product"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 stroke-gray-500 group-hover:stroke-blue-500 transition-colors duration-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                        />
                                    </svg>
                                </button>

                                {/* Share Dropdown */}
                                {showShareMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
                                        {shareActions.map((item, index) => (
                                            <button
                                                key={index}
                                                onClick={item.action}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                            >
                                                <span className="text-gray-500">{item.icon}</span>
                                                {item.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-0.5 mt-1">
                        {Array(5).fill('').map((_, i) => (
                            <img key={i} src={i < Math.round(averageRating) ? assets.star_icon : assets.star_dull_icon} alt="star" className="md:w-4 w-3.5" />
                        ))}
                        <p className="text-base ml-2">({totalReviews})</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency} {product.price}</p>
                        <p className="text-2xl font-medium">MRP: {currency}{product.offerPrice}</p>
                        <span className="text-gray-500/70">(inclusive of all taxes)</span>
                    </div>

                    
                    {/* Wholesale Size & Pieces Selection Section */}
                    <div className="mt-8 bg-[#FAF8F5] border border-[#EADBCC] rounded-2xl p-4 sm:p-6 shadow-sm">
                        {/* Header & Quick Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EADBCC]/60">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary text-white tracking-wide uppercase">
                                        Wholesale Order
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">B2B Bulk Pricing</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mt-1">Select Sizes & Pieces of Pants</h3>
                                <p className="text-xs text-gray-500">Pick individual sizes or pick all sizes, enter pieces per size, and order all together.</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Pick All Sizes Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const isAll = sizes.every(s => selectedSizes.includes(s));
                                        if (isAll) {
                                            setSelectedSizes([]);
                                        } else {
                                            setSelectedSizes([...sizes]);
                                            const updated = { ...sizePieces };
                                            sizes.forEach(s => {
                                                if (!updated[s] || updated[s] === 0) updated[s] = bulkQty || 10;
                                            });
                                            setSizePieces(updated);
                                        }
                                    }}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 border flex items-center gap-1.5 shadow-2xs ${
                                        sizes.every(s => selectedSizes.includes(s))
                                            ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {sizes.every(s => selectedSizes.includes(s)) ? 'All Sizes Picked' : 'Pick All Sizes'}
                                </button>

                                {/* Size Chart Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowSizeChart(!showSizeChart)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-white border border-gray-300 hover:border-gray-400 cursor-pointer transition flex items-center gap-1.5 shadow-2xs"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h18M3 18h18" />
                                    </svg>
                                    {showSizeChart ? 'Hide Chart' : 'Size Chart'}
                                </button>
                            </div>
                        </div>

                        {/* Collapsible Size Chart */}
                        {showSizeChart && (
                            <div className="mt-4 p-3.5 bg-white rounded-xl border border-gray-200 animate-fadeIn">
                                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Pants Measurement Chart (Inches)</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="bg-gray-100 text-gray-600 uppercase font-semibold">
                                                <th className="py-2 px-3">Size</th>
                                                <th className="py-2 px-3">Waist</th>
                                                <th className="py-2 px-3">Hip</th>
                                                <th className="py-2 px-3">Length</th>
                                                <th className="py-2 px-3">Inseam</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {sizes.map((s) => (
                                                <tr key={s} className="hover:bg-gray-50">
                                                    <td className="py-1.5 px-3 font-bold text-gray-800">{s}</td>
                                                    <td className="py-1.5 px-3 text-gray-600">{sizeDetails[s].waist}</td>
                                                    <td className="py-1.5 px-3 text-gray-600">{sizeDetails[s].hip}</td>
                                                    <td className="py-1.5 px-3 text-gray-600">{sizeDetails[s].length}</td>
                                                    <td className="py-1.5 px-3 text-gray-600">{sizeDetails[s].inseam}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Sizes Pills Selector */}
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Step 1: Pick Sizes</p>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {sizes.map((size) => {
                                    const isSelected = selectedSizes.includes(size);
                                    return (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedSizes(prev => prev.filter(s => s !== size));
                                                } else {
                                                    setSelectedSizes(prev => [...prev, size]);
                                                    if (!sizePieces[size] || sizePieces[size] === 0) {
                                                        setSizePieces(prev => ({ ...prev, [size]: bulkQty || 10 }));
                                                    }
                                                }
                                            }}
                                            className={`p-2 rounded-xl border text-center cursor-pointer transition-all duration-200 relative ${
                                                isSelected
                                                    ? 'bg-primary text-white border-primary shadow-sm scale-[1.02]'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary/60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-sm">{size}</span>
                                                <span className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold ${
                                                    isSelected ? 'bg-white text-primary' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                    {isSelected ? '✓' : '+'}
                                                </span>
                                            </div>
                                            <p className={`text-[10px] mt-0.5 truncate ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                                {sizeDetails[size].waist}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Quick Bulk Pieces Setter */}
                        <div className="mt-4 p-3 bg-white rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">Step 2: Bulk Pieces Setter:</span>
                                <div className="flex items-center gap-1">
                                    {[5, 10, 20, 50].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => {
                                                setBulkQty(preset);
                                                const target = selectedSizes.length > 0 ? selectedSizes : sizes;
                                                if (selectedSizes.length === 0) setSelectedSizes([...sizes]);
                                                const updated = { ...sizePieces };
                                                target.forEach(s => { updated[s] = preset; });
                                                setSizePieces(updated);
                                                toast.success(`Set ${preset} pieces for all picked sizes`);
                                            }}
                                            className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition border ${
                                                bulkQty === preset ? 'bg-primary/10 border-primary text-primary font-bold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {preset} pcs
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                                <input
                                    type="number"
                                    min="1"
                                    value={bulkQty}
                                    onChange={(e) => setBulkQty(Math.max(1, parseInt(e.target.value) || 1))}
                                    placeholder="Qty"
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center font-semibold outline-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const count = Math.max(1, parseInt(bulkQty) || 1);
                                        const target = selectedSizes.length > 0 ? selectedSizes : sizes;
                                        if (selectedSizes.length === 0) setSelectedSizes([...sizes]);
                                        const updated = { ...sizePieces };
                                        target.forEach(s => { updated[s] = count; });
                                        setSizePieces(updated);
                                        toast.success(`Applied ${count} pieces to ${target.length} sizes`);
                                    }}
                                    className="px-3 py-1 bg-gray-800 hover:bg-black text-white text-xs font-medium rounded cursor-pointer transition"
                                >
                                    Apply to Picked
                                </button>
                            </div>
                        </div>

                        {/* Step 3: Size-wise Pieces Breakdown */}
                        <div className="mt-4">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Step 3: Pieces of Pants per Size</p>
                            
                            {selectedSizes.length === 0 ? (
                                <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-300">
                                    <p className="text-sm text-gray-500 font-medium">No sizes picked yet</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedSizes([...sizes]);
                                            const updated = { ...sizePieces };
                                            sizes.forEach(s => { if (!updated[s]) updated[s] = 10; });
                                            setSizePieces(updated);
                                        }}
                                        className="mt-2 text-xs text-primary font-bold hover:underline cursor-pointer"
                                    >
                                        Click here to Pick All Sizes (S to 3XL)
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                                    {selectedSizes.map((size) => {
                                        const qty = sizePieces[size] || 0;
                                        const itemSubtotal = qty * (product?.offerPrice || 0);

                                        return (
                                            <div key={size} className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                                                        {size}
                                                    </span>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-800">Size {size} Pant</p>
                                                        <p className="text-[11px] text-gray-400">Waist: {sizeDetails[size].waist}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* Pieces Counter */}
                                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVal = Math.max(0, qty - 5);
                                                                setSizePieces(prev => ({ ...prev, [size]: newVal }));
                                                            }}
                                                            className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs cursor-pointer transition"
                                                            title="Decrease 5 pieces"
                                                        >
                                                            -5
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVal = Math.max(0, qty - 1);
                                                                setSizePieces(prev => ({ ...prev, [size]: newVal }));
                                                            }}
                                                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 font-bold text-xs cursor-pointer transition border-l border-r border-gray-200"
                                                            title="Decrease 1 piece"
                                                        >
                                                            -
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={qty}
                                                            onChange={(e) => {
                                                                const val = Math.max(0, parseInt(e.target.value) || 0);
                                                                setSizePieces(prev => ({ ...prev, [size]: val }));
                                                            }}
                                                            className="w-14 text-center font-bold text-gray-800 text-xs py-1 outline-none"
                                                        />
                                                        <span className="text-[11px] text-gray-400 pr-1.5 font-medium select-none">pcs</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVal = qty + 1;
                                                                setSizePieces(prev => ({ ...prev, [size]: newVal }));
                                                            }}
                                                            className="px-2 py-1 hover:bg-gray-100 text-gray-600 font-bold text-xs cursor-pointer transition border-l border-r border-gray-200"
                                                            title="Increase 1 piece"
                                                        >
                                                            +
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newVal = qty + 5;
                                                                setSizePieces(prev => ({ ...prev, [size]: newVal }));
                                                            }}
                                                            className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs cursor-pointer transition"
                                                            title="Increase 5 pieces"
                                                        >
                                                            +5
                                                        </button>
                                                    </div>

                                                    {/* Subtotal */}
                                                    <div className="text-right min-w-[70px]">
                                                        <p className="text-xs font-bold text-gray-800">{currency}{itemSubtotal}</p>
                                                        <p className="text-[10px] text-gray-400">({qty} pcs)</p>
                                                    </div>

                                                    {/* Remove size button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedSizes(prev => prev.filter(s => s !== size))}
                                                        className="text-gray-400 hover:text-red-500 p-1 cursor-pointer transition"
                                                        title="Remove size"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Wholesale Order Summary Card */}
                        {(() => {
                            const activeItems = selectedSizes
                                .filter(s => (sizePieces[s] || 0) > 0)
                                .map(s => ({
                                    itemId: product?._id,
                                    size: s,
                                    quantity: sizePieces[s],
                                }));
                            const totalPcs = activeItems.reduce((acc, curr) => acc + curr.quantity, 0);
                            const totalAmount = totalPcs * (product?.offerPrice || 0);
                            const totalMRP = totalPcs * (product?.price || 0);
                            const savings = totalMRP - totalAmount;

                            return (
                                <div className="mt-5 p-4 rounded-xl bg-white border border-[#EADBCC] shadow-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Wholesale Order Summary</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-base font-bold text-gray-900">{totalPcs} Total Pieces</span>
                                                <span className="text-xs text-gray-400">across {activeItems.length} picked size(s)</span>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-gray-400 line-through">MRP: {currency}{totalMRP}</p>
                                            <p className="text-xl font-extrabold text-primary">{currency}{totalAmount}</p>
                                            {savings > 0 && (
                                                <p className="text-[11px] font-semibold text-emerald-600">You Save: {currency}{savings} (Wholesale rate)</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons: Order separately in one time */}
                                    <div className="flex flex-col sm:flex-row items-center mt-4 gap-3 text-base">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!product) return;
                                                if (activeItems.length === 0 || totalPcs === 0) {
                                                    toast.error("Please pick sizes and enter pieces of pants");
                                                    return;
                                                }
                                                if (addMultipleToCart) {
                                                    addMultipleToCart(activeItems);
                                                } else {
                                                    activeItems.forEach(item => addToCart(item.itemId, item.size, item.quantity));
                                                }
                                            }}
                                            className="w-full py-3.5 px-4 rounded-xl cursor-pointer font-bold bg-white text-gray-800 border-2 border-primary/40 hover:bg-primary/5 hover:border-primary transition flex items-center justify-center gap-2 shadow-2xs"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                            </svg>
                                            Add to Cart ({totalPcs} Pieces)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!product) return;
                                                if (activeItems.length === 0 || totalPcs === 0) {
                                                    toast.error("Please pick sizes and enter pieces of pants");
                                                    return;
                                                }
                                                if (addMultipleToCart) {
                                                    addMultipleToCart(activeItems);
                                                } else {
                                                    activeItems.forEach(item => addToCart(item.itemId, item.size, item.quantity));
                                                }
                                                navigate("/cart");
                                            }}
                                            className="w-full py-3.5 px-4 rounded-xl cursor-pointer font-bold bg-primary text-white hover:bg-primary-dull transition flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            Buy Now ({totalPcs} Pieces)
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-center text-gray-400 mt-2">
                                        ⚡ All {activeItems.length} sizes will be ordered together as separate line items in one time.
                                    </p>
                                </div>
                            );
                        })()}
                    </div>
                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>
                </div>
            </div>
            {/* Reviews Section */}
            <div className="mt-16">
                <h2 className="text-2xl font-medium mb-6">Customer Reviews</h2>
                
                {/* Write Review */}
                {user && (
                    <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-lg max-w-2xl">
                        <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                        <div className="flex gap-1 mb-4">
                            {Array(5).fill('').map((_, i) => (
                                <img 
                                    key={i} 
                                    src={i < rating ? assets.star_icon : assets.star_dull_icon} 
                                    alt="star" 
                                    className="w-8 cursor-pointer p-1"
                                    onClick={() => setRating(i + 1)}
                                />
                            ))}
                        </div>
                        <textarea 
                            className="w-full p-3 border border-gray-300 rounded mb-4 outline-primary bg-white"
                            rows="4"
                            placeholder="Share your experience with this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                        <button onClick={submitReview} className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary-dull transition">
                            Submit Review
                        </button>
                    </div>
                )}

                {/* Display Reviews */}
                <div className="space-y-6 max-w-2xl">
                    {totalReviews === 0 ? (
                        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                    ) : (
                        product.reviews.map((review, index) => (
                            <div key={index} className="border-b border-gray-200 pb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium text-gray-600">
                                        {review.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{review.name}</p>
                                        <div className="flex items-center gap-0.5">
                                            {Array(5).fill('').map((_, i) => (
                                                <img key={i} src={i < review.rating ? assets.star_icon : assets.star_dull_icon} alt="star" className="w-3" />
                                            ))}
                                            <span className="text-xs text-gray-400 ml-2">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/*relatedProducts */}
            <div className="flex flex-col items-center mt-20">
                <div className="flex flex-col items-center w-max">
                    <p className="text-3xl font-medium">Related Products</p>
                    <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6 lg:grid-cols-5 mt-6 w-full">
                    {relatedProducts.filter((product)=>product.inStock).map((product, index)=>(
                        <ProductCard key={index} product={product}/>
                    ))}
                </div>
                <button onClick={()=> {navigate('/product'); scrollTo(0,0)}} className="mx-auto cursor-pointer px-12 my-16 py-2.5 border rounded text-primary hover:bg-primary/10 transition">See more</button>
            </div>
        </div>
    );
};

export default ProductDetails