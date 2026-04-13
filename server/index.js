import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDb from './config/connectDb.js';
import authrouter from './routes/auth.route.js';
import userrouter from './routes/user.routes.js';
import interviewRouter from './routes/interview.route.js';
import paymentRouter from './routes/payment.route.js';
const app=express();
app.use(cors({
    origin:"https://interview-with-ai-client.onrender.com",
    credentials:true
}))
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth",authrouter)
app.use("/api/user",userrouter)
app.use("/api/interview",interviewRouter)
app.use("/api/payment",paymentRouter)
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
   connectDb();
});
