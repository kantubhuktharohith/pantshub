import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from 'react-hot-toast';
import { Link,useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {

    const {products, navigate, currency, addToCart, axios, fetchProducts, user} = useAppContext()
    const {id} = useParams()
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

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

    return product && (
        <div className="mt-12">
            <p className="text-sm flex flex-wrap gap-1">
                <Link to={"/"}>Home</Link> /
                <Link to={"/product"}> Products</Link> /
                <Link to={`product/${product.category.toLowerCase()}`}> {product.category}</Link> /
                <span className="text-primary"> {product.name}</span>
            </p>

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
                    <h1 className="text-3xl font-medium">{product.name}</h1>

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

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex flex-col sm:flex-row items-center mt-10 gap-3 sm:gap-4 text-base">
                        <button onClick={()=> addToCart(product._id)} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition" >
                            Add to Cart
                        </button>
                        <button onClick={()=> {addToCart(product._id); navigate("/cart")}} className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull transition" >
                            Buy now
                        </button>
                    </div>
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