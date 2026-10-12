import supabase from "../configs/supabase.js"

// update user cartdata : /api/cart/update

export const updateCart = async (req, res)=>{
    try {
        const { userId, cartItems } = req.body
        const { error } = await supabase
            .from('users')
            .update({ cart_items: cartItems })
            .eq('id', userId);

        if (error) throw error;

        res.json({ success: true, message: "Cart Updated" })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}