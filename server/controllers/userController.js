import supabase from "../configs/supabase.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';


export const register = async (req,res)=>{
    try{
            const { name, email, password } = req.body;

            if(!name || !email || !password){
                return res.json({success: false, message: 'Missing Details'})
            }

            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if(existingUser)
                return res.json({success: false, message: 'User already exists'})

            const  hashedPassword = await bcrypt.hash(password, 10)

            const { data: user, error } = await supabase
                .from('users')
                .insert({ name, email, password: hashedPassword })
                .select()
                .single();

            if(error) throw error;

            const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn:'7d'})

            res.cookie('token', token, {
                httpOnly: true, 
                secure: true, 
                sameSite: 'none', 
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                })
                return res.json({success: true, token, user: {_id: user.id, email: user.email, name: user.name, cartItems: user.cart_items}})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}


export const login = async (req, res)=>{
    try {
        const { email, password } = req.body;

        if(!email || !password)
            return res.json({success: false, message: 'Email and password are required'});
        
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if(error || !user){
            return res.json({success: false, message: 'Invalid email or password'});
        }

        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch)
            return res.json({success: false, message: 'Invalid email or password'});

        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn:'7d'})

            res.cookie('token', token, {
                httpOnly: true, 
                secure: true, 
                sameSite: 'none', 
                maxAge: 7 * 24 * 60 * 60 * 1000, 
                })
                return res.json({success: true, token, user: {_id: user.id, email: user.email, name: user.name, cartItems: user.cart_items}})

    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}

// check auth :/api/user/is-auth
export const isAuth = async (req, res)=>{
    try {
        console.log('Auth check - req.body:', req.body);
        console.log('Auth check - req.cookies:', req.cookies);

        const { userId } = req.body;
        if(!userId) {
            console.log('No userId found in request');
            return res.json({success: false, message: 'User not authenticated'})
        }

        console.log('Looking up user with ID:', userId);
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, phone, location, cart_items, created_at, updated_at')
            .eq('id', userId)
            .single();

        if(error || !user) {
            console.log('User not found in database');
            return res.json({success: false, message: 'User not found'})
        }

        // Map fields for frontend compatibility
        const mappedUser = { _id: user.id, ...user, cartItems: user.cart_items };

        console.log('User found:', { id: user.id, email: user.email, name: user.name });
        return res.json({success: true, user: mappedUser})

    } catch (error) {
        console.log('Auth check error:', error.message);
        res.json({success: false, message: error.message });
    }
}


//Logout User : /api/user/logout
export const logout = async (req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
        });
        return res.json({ success: true, message: "Logged Out" })
    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}

// Update User Profile : /api/user/profile
export const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, location } = req.body;

        if (!name || name.trim() === '') {
            return res.json({ success: false, message: "Name is required" });
        }

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ name: name.trim(), phone: phone || '', location: location || '' })
            .eq('id', userId)
            .select('id, name, email, phone, location, cart_items, created_at, updated_at')
            .single();

        if (error || !updatedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        // Map fields for frontend compatibility
        const mappedUser = { _id: updatedUser.id, ...updatedUser, cartItems: updatedUser.cart_items };

        return res.json({ success: true, message: "Profile updated successfully", user: mappedUser });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}