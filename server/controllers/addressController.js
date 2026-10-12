import supabase from "../configs/supabase.js"


//Add address : /api/address/add
export const addAddress = async(req, res)=>{
    try {
        const { address, userId } = req.body

        const { data, error } = await supabase
            .from('addresses')
            .insert({
                user_id: userId,
                first_name: address.firstName,
                last_name: address.lastName,
                email: address.email,
                street: address.street,
                city: address.city,
                state: address.state,
                zipcode: address.zipcode,
                country: address.country,
                phone: address.phone,
            })
            .select()
            .single();

        if (error) throw error;

        res.json({success: true, message: "Address added successfully"})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// get address :/api/address/get
export const getAddress = async(req, res)=>{
    try {
        const { userId } = req.body

        const { data: addresses, error } = await supabase
            .from('addresses')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        // Map fields for frontend compatibility
        const mappedAddresses = addresses.map(a => ({
            _id: a.id,
            userId: a.user_id,
            firstName: a.first_name,
            lastName: a.last_name,
            email: a.email,
            street: a.street,
            city: a.city,
            state: a.state,
            zipcode: a.zipcode,
            country: a.country,
            phone: a.phone,
        }));

        res.json({success: true, addresses: mappedAddresses})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}