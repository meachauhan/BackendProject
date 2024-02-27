import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { APIerror } from "../utils/APIerror.js";
import {User} from "../models/user.models.js"
export const verifyJWT= asyncHandler (async(req, res, next)=>{
    try {
        const token= req.header("Authorization")?.replace("Bearer ","")|| req.cookie.accessToken
        console.log("token", token)
        if(!token) throw new APIerror(401,"Unathorized access ")
        
        console.log("Decoded Token: ", jwt.verify(token?.trim(),process.env.ACCESS_TOKEN_SECRET));
        const decodedToken=await jwt.verify(token.trim(),process.env.ACCESS_TOKEN_SECRET)
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user) throw new APIerror(401,"Invalid access token")
        
    
        req.user=user
        next()
    
    } catch (error) {
        throw new APIerror(401,"Invalid access token")
    }

})