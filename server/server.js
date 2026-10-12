import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhook } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

await connectCloudinary()

// allow multiple origins
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://greencart-4y4c.vercel.app'
]

const corsOptions = { origin: allowedOrigins, credentials: true }

// ✅ CORS must come FIRST — before all routes
// cors() middleware automatically handles OPTIONS preflight requests
app.use(cors(corsOptions));

app.use(cookieParser());
app.set('trust proxy', 1);

// Stripe webhook (needs raw body, placed after cors but before express.json globally)
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(express.json());

app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)

// for local development
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

// Required for Vercel serverless — export the app
export default app;
