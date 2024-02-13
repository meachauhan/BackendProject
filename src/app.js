import { express, json } from "express";
import cors from "cors"
import cookieParser from cookieParser


const app=express()

//Basic Middleware configuration
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credential: true
}))

app.use(express.json({limit:"16Kb"}))
app.use(express.urlencoded({limit:"16kb",extended:true}))
app.use(express.static("public"))
app.use(cookieParser())


export {app}