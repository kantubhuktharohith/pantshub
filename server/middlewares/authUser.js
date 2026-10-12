import jwt from 'jsonwebtoken';

const authUser = async (req, res, next)=>{
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1] || req.headers.token;
    console.log('Auth middleware - token present:', !!token);

    if(!token) {
        console.log('No token found in cookies or headers');
        return res.json({ success: false, message: 'Not Authorized' });
    }

    try {
        console.log('Verifying token...');
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        console.log('Token decoded:', tokenDecode);

        if(tokenDecode){
            req.body = req.body || {};
            req.body.userId = tokenDecode.id;
            console.log('Set userId in req.body:', req.body.userId);
        }else{
            console.log('Token verification failed');
            return res.json({ success: false, message: 'Not Authorized' });
        }
        next();

    } catch (error) {
        console.log('Token verification error:', error.message);
        res.json({ success: false, message: error.message});
    }
}

export default authUser;