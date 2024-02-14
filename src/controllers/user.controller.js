import asyncHandler from "../utils/asyncHandler.js"
import {APIerror} from "../utils/APIerror.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { APIResponse } from "../utils/APIResponse.js"

const registerUser = asyncHandler(async(req,res)=>{
    // get User details from frontend
    // validation not empty
    // check user already exist :username, email
    // check for images, check for avatar
    // upload them to clodinary
    // create user Object : create entry in db
    // remove password and refresh token filed from response
    // check for user creation
    // return response
    
    // get User details from frontend
    const {fullname, email, username, password} = req.body
    console.info(`email: ${email}`)

    if(
        [fullname,email,username,password].some((filed)=> filed?.trim()==="")
    ){
        throw new APIerror(400, "All fields are required")
    }

    const exitedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(exitedUser){
        throw new APIerror(409,"User with username or email already exists")
    }

    //local path of images uploaded on server by multer
    console.log(req.files)
    const avatarLocalPath=req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path


    let coverImageLocalPath ;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new APIerror(400,"Avatar Image is required")
    }

   const avatar= await uploadOnCloudinary(avatarLocalPath)
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)

   console.log("Cover Image Path", coverImage);

   if(!avatar) throw new APIerror(400,"Avatar Image is required")

   const user=await User.create(
    {
        fullname,
        avatar:avatar.url,
        coverImage:coverImage.url,
        email,
        username:username.toLowerCase(),
        password
    })
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new APIerror(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new APIResponse(201,createdUser,"User registered successfully")
    )
    
})

export {registerUser}
