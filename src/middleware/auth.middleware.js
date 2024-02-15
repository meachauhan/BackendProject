import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import APIError from "../utils/apiError.js";
import User from "../models/User.js"
export const verifyJWT= asyncHandler (async(req, res, next)=>{
    try {
        const token=req.cookie.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token) throw new APIError(401,"Unathorized access ")
    
        const decodedToken=await jwt.verify(token,process.env.ACCESS_TOKEN_SECERT)
        
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user) throw new APIError(401,"Invalid access token")
        
    
        req.user=user
        next()
    
    } catch (error) {
        throw new APIError(401,"Invalid access token")
    }

})