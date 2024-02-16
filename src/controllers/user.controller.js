import asyncHandler from "../utils/asyncHandler.js"
import {APIerror} from "../utils/APIerror.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { APIResponse } from "../utils/APIResponse.js"

const generateAccessAndRefreshToken= async(userid)=>{
    try {

        const user = await User.findById(userid)
        const accessToken=user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
        
    } catch (error) {
        throw new APIerror(500,"Something Went wrong while creating access and refresh token")
    }
}

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

const loginUser = asyncHandler (async (req,res)=> {
    //  fetch data from frontend
    //  username or email
    //  find user
    //  validate the details :Password check
    //  create access token and refresh token 
    //  Send Secure cookies

    // fetch data from req body

    const { email, username, password} = req.body

    if(!username || !email)  throw new APIerror(400,"Username or Email is required")

    //find User by username or email
    const user= await User.findOne({
        $or:[{username,email}]
    })

    if(!user) throw new APIerror (404,"User doesn't Exist.")
    
    //Password Check
    const isPassowrdValid= await user.isPasswordIsCorrect(password)
    if(!isPassowrdValid) throw new APIerror(401,"Invalid user Credentials")

    const {accessToken, refreshToken}= await generateAccessAndRefreshToken(user._id)

    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

    //cokkieOption
    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("accesToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new APIResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User LoggedIn successfully"
        )
    )



})


const logoutUser= asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined,
        }},{
            new:true,
        }
    )
    

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new APIResponse(200,{},"User LoggedOut Successfully"))

    

})


const refreshAccessToken= asyncHandler(async(req,res)=>{

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) throw new APIResponseError(401,`Invalid refresh token`)

    const decodedToken=jwt.verify(incomingRefreshToken,process.env.ACCESS_REFRESH_SECRET)

    const user= await User.findById(decodedToken?._id)

    if(!user) throw new APIResponseError(401,`Invalid refresh token`)

    if(incomingRefreshToken!==user?.refreshAccessToken) throw new APIResponseError(401,`Refresh token is expired or used`)

    const options = {
        httpOnly: true,
        secure: true,
    }
    
    const {accessToken, refreshToken}=await generateAccessAndRefreshToken(user_id)

    return res
    .status(200)
    .cookie("accesssToken", accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new APIResponse(
            200,
            {accessToken, refreshToken: refreshToken},
            "Access Token is Refreshed"
        )
    )
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }
