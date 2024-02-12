import mongoose from "mongoose";
import { DB_NAME } from "../constans.js";

const connectDB=async ()=>{
    try {
       const connectInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`MongoDB connection Successfull !!! DBHOST: ${connectInstance.connection.host}`);
    } catch (error) {
        console.error("MognoDB CONNECTION ERROR", error);
        process.exit(1)
    }
}


export default connectDB