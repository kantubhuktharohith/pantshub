import { v2 as cloudinary } from "cloudinary"
import supabase from "../configs/supabase.js"

// add product : /api/product/add
export const addProduct = async (req, res)=>{
    try {
        let productData = JSON.parse(req.body.productData)

        const images = req.files
            
        let imagesUrl = await Promise.all(
            images.map(async (item)=>{
                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )

        const { error } = await supabase
            .from('products')
            .insert({
                name: productData.name,
                description: productData.description,
                price: productData.price,
                offer_price: productData.offerPrice,
                image: imagesUrl,
                category: productData.category,
                in_stock: productData.inStock !== undefined ? productData.inStock : true,
            });

        if (error) throw error;

        res.json({success: true, message: "Product Added"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// get product : /api/product/list
export const productList = async (req, res)=>{
    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*, reviews(*)');

        if (error) throw error;

        // Map fields for frontend compatibility
        const mappedProducts = products.map(p => ({
            _id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            offerPrice: p.offer_price,
            image: p.image,
            category: p.category,
            inStock: p.in_stock,
            reviews: (p.reviews || []).map(r => ({
                _id: r.id,
                userId: r.user_id,
                name: r.name,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
            })),
            createdAt: p.created_at,
            updatedAt: p.updated_at,
        }));

        res.json({success: true, products: mappedProducts})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// get  product : /api/product/Id
export const productById = async (req, res)=>{
    try {
        const { id } = req.body
        const { data: product, error } = await supabase
            .from('products')
            .select('*, reviews(*)')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Map fields for frontend compatibility
        const mappedProduct = {
            _id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            offerPrice: product.offer_price,
            image: product.image,
            category: product.category,
            inStock: product.in_stock,
            reviews: (product.reviews || []).map(r => ({
                _id: r.id,
                userId: r.user_id,
                name: r.name,
                rating: r.rating,
                comment: r.comment,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
            })),
            createdAt: product.created_at,
            updatedAt: product.updated_at,
        };

        res.json({success: true, product: mappedProduct})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
} 

// change product instock : /api/product/Id
export const changeStock = async (req, res)=>{
    try {
        const { id, inStock } = req.body
        const { error } = await supabase
            .from('products')
            .update({ in_stock: inStock })
            .eq('id', id);

        if (error) throw error;

        res.json({success: true, message: "Stock Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// add review to product : /api/product/review
export const addReview = async (req, res)=>{
    try {
        const { productId, rating, comment, userId } = req.body;

        if (!productId || !rating || !comment) {
            return res.json({ success: false, message: "Please provide all review details." });
        }

        // Check if user has purchased the product
        const { data: purchasedItems } = await supabase
            .from('order_items')
            .select('id, order_id!inner(user_id)')
            .eq('product_id', productId)
            .eq('order_id.user_id', userId)
            .limit(1);

        if (!purchasedItems || purchasedItems.length === 0) {
            return res.json({ success: false, message: "You can only review products you have purchased." });
        }

        // Get user name
        const { data: user } = await supabase
            .from('users')
            .select('name')
            .eq('id', userId)
            .single();

        // Check if product exists
        const { data: product } = await supabase
            .from('products')
            .select('id')
            .eq('id', productId)
            .single();

        if (!product) {
            return res.json({ success: false, message: "Product not found." });
        }

        // Upsert review (unique constraint on product_id + user_id handles update-or-insert)
        const { error } = await supabase
            .from('reviews')
            .upsert({
                product_id: productId,
                user_id: userId,
                name: user.name,
                rating: Number(rating),
                comment,
            }, { onConflict: 'product_id,user_id' });

        if (error) throw error;

        res.json({ success: true, message: "Review added successfully." });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}