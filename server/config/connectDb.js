import mongoose from "mongoose";
const connectDb=async()=>{
    try{
          await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to MongoDB");
    }
    catch{
        console.log(`Error connecting to MongoDB: ${error.message}`);
    }
}
export default connectDb;