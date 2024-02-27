import  express from "express";

import cors from "cors"
import cookieParser from "cookie-parser"
// const swaggerUI=require('swagger-ui-express')
// const swaggerfile=require('../docs/swagger-output.json')
// import {swd
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


//routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"

//routes declartion
app.use('/api/v1/users',userRouter)
app.use('/api/v1/videos',videoRouter)
// app.user('/docs',swaggerUI.serve,swaggerUI.setup(swaggerfile))

//htpps://localhost:8000/api/v1/users


export {app}