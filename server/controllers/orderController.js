import supabase from "../configs/supabase.js";
import stripe from "stripe"

// Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        // Calculate amount using items
        let amount = 0;
        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('offer_price')
                .eq('id', item.product)
                .single();
            amount += product.offer_price * item.quantity;
        }

        //Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                amount,
                address_id: address,
                payment_type: "COD",
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Insert order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product,
            quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Clear user cart
        await supabase
            .from('users')
            .update({ cart_items: {} })
            .eq('id', userId);

        return res.json({success: true, message: "Order Placed Successfully" })
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

// Place Order Stripe /api/order/stripe
export const placeOrderStripe = async (req, res)=>{
    try {
        const { userId, items, address } = req.body;
        const {origin} = req.headers;

        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        let productData = [];
        let amount = 0;

        // Calculate amount using items
        for (const item of items) {
            const { data: product } = await supabase
                .from('products')
                .select('name, offer_price')
                .eq('id', item.product)
                .single();
            productData.push({
                name: product.name,
                price: product.offer_price,
                quantity: item.quantity,
            });
            amount += product.offer_price * item.quantity;
        }

        //Add Tax Charge (2%)
        amount += Math.floor(amount * 0.02);

        // Check Stripe minimum amount (INR requires at least ₹40)
        if (amount < 40) {
            return res.json({ success: false, message: "Stripe requires a minimum order amount of ₹40. Please add more items to your cart." });
        }

        // Create order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                amount,
                address_id: address,
                payment_type: "Online",
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Insert order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product,
            quantity: item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Stripe Payment Intent
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        
        // create line items for stripe
        const line_items = productData.map((item)=>{
            return {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100, // Convert to paise and add tax

                },
                quantity: item.quantity,
            }
        })

        //create session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: `${origin}/loader?next=my-orders`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order.id,
                userId,
            }
        })

        return res.json({success: true, url: session.url })
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}


// Stripe Webhook to Verify Payment Action : /stripe
export const stripeWebhook = async (req, res)=>{
    // Stripe Gateway Initialize 
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;

            //Mark Payment as Paid
            await supabase
                .from('orders')
                .update({ is_paid: true })
                .eq('id', orderId);

            //Clear User Cart
            await supabase
                .from('users')
                .update({ cart_items: {} })
                .eq('id', userId);
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;

            // Delete order items first (cascade should handle this, but explicit is safe)
            await supabase
                .from('order_items')
                .delete()
                .eq('order_id', orderId);

            await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);
            break;
        }

        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    res.json({received: true});
}

// get orders by user ID : /api/order/user
export const getUserOrders = async (req, res)=>{
    try {
        const { userId } = req.body;

        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                address:addresses(*),
                order_items(
                    *,
                    product:products(*)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map fields for frontend compatibility
        const mappedOrders = orders.map(o => ({
            _id: o.id,
            userId: o.user_id,
            amount: o.amount,
            status: o.status,
            paymentType: o.payment_type,
            isPaid: o.is_paid,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            address: o.address ? {
                _id: o.address.id,
                userId: o.address.user_id,
                firstName: o.address.first_name,
                lastName: o.address.last_name,
                email: o.address.email,
                street: o.address.street,
                city: o.address.city,
                state: o.address.state,
                zipcode: o.address.zipcode,
                country: o.address.country,
                phone: o.address.phone,
            } : null,
            items: (o.order_items || []).map(item => ({
                _id: item.id,
                quantity: item.quantity,
                product: item.product ? {
                    _id: item.product.id,
                    name: item.product.name,
                    description: item.product.description,
                    price: item.product.price,
                    offerPrice: item.product.offer_price,
                    image: item.product.image,
                    category: item.product.category,
                    inStock: item.product.in_stock,
                } : null,
            })),
        }));

        res.json({ success: true, orders: mappedOrders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// get all orders ( for seller / admin ) : /api/order/seller
export const getAllOrders = async (req, res)=>{
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                user:users(id, name, email),
                address:addresses(*),
                order_items(
                    *,
                    product:products(*)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map fields for frontend compatibility
        const mappedOrders = orders.map(o => ({
            _id: o.id,
            userId: o.user ? { _id: o.user.id, name: o.user.name, email: o.user.email } : o.user_id,
            amount: o.amount,
            status: o.status,
            paymentType: o.payment_type,
            isPaid: o.is_paid,
            createdAt: o.created_at,
            updatedAt: o.updated_at,
            address: o.address ? {
                _id: o.address.id,
                userId: o.address.user_id,
                firstName: o.address.first_name,
                lastName: o.address.last_name,
                email: o.address.email,
                street: o.address.street,
                city: o.address.city,
                state: o.address.state,
                zipcode: o.address.zipcode,
                country: o.address.country,
                phone: o.address.phone,
            } : null,
            items: (o.order_items || []).map(item => ({
                _id: item.id,
                quantity: item.quantity,
                product: item.product ? {
                    _id: item.product.id,
                    name: item.product.name,
                    description: item.product.description,
                    price: item.product.price,
                    offerPrice: item.product.offer_price,
                    image: item.product.image,
                    category: item.product.category,
                    inStock: item.product.in_stock,
                } : null,
            })),
        }));

        res.json({ success: true, orders: mappedOrders });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// update order status (Seller/Admin) : /api/order/status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;

        res.json({ success: true, message: "Order status updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// cancel order (User) : /api/order/cancel
export const cancelOrder = async (req, res) => {
    try {
        const { orderId, userId } = req.body;

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', userId)
            .single();
        
        if (fetchError || !order) {
            return res.json({ success: false, message: "Order not found" });
        }
        
        if (order.status !== 'Order Placed') {
            return res.json({ success: false, message: "Cannot cancel order at this stage." });
        }
        
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status: "Cancelled" })
            .eq('id', orderId);

        if (updateError) throw updateError;
        
        res.json({ success: true, message: "Order cancelled successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}