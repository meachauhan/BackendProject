import dotenv from "dotenv"
import connectDB from "./db/db.js"
import { app } from "./app.js"

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 ,()=>(console.log(`Server is running at : ${process.env.PORT}`)))
    app.on((err)=>{
        console.log(`Error`, err);
    })
})  
.catch((err)=>{
    console.log("MONGODB CONNECTION FAILED: ", err);
})