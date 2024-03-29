import asyncHandler from "../utils/asyncHandler.js"
import {APIerror} from "../utils/APIerror.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { APIResponse } from "../utils/APIResponse.js"
import mongoose from "mongoose"

const generateAccessAndRefreshToken= async(userid)=>{
    try {

        const user = await User.findById(userid)
        console.log(user)//
        const accessToken= user.generateAccessToken()
        console.log("Access tOken: ",accessToken)
        const refreshToken=  user.generateRefreshToken()
        // console.log(accessToken, refreshToken)
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

    const {email, username, password} = req.body
    // console.log(`${email} ${username} ${password} ${req.body.username}`);
    if(!username && !email)  throw new APIerror(400,"Username or Email is required")

    //find User by username or email
    const user= await User.findOne({
        $or:[{username,email}]
    })

    if(!user) throw new APIerror (404,"User doesn't Exist.")
    
    //Password Check
    const isPassowrdValid= await user.isPasswordIsCorrect(password)
    if(!isPassowrdValid) throw new APIerror(401,"Invalid user Credentials")
    console.log(user.username, user._id)

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

    const refreshToken = req.cookie

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


const changeUserPassword = asyncHandler(async (req, res) => {

     const {oldPassword, newPassword} =req.body
     const user =await User.findById(req.user?._id)
    const  isPasswordIsCorrect = await User.isPasswordCorrect(oldPassword)

    if(!isPasswordIsCorrect) throw new APIerror(401, "Invalid password")

    user.password= newPassword
     await user.save({validateBeforeSave: false}) 

     return res.satuts(200)
     .json(new APIResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler( async (req, res) => {

    return res
    .status(200)
    .json(new APIResponse(200, req.user, "Current User fetched successfully"))
})


const updateAccountDetails = asyncHandler (async (req, res) => {

    const {fullname, email} = req.body

    if (!fullname && !email) throw new APIerror(401, "All fileds are required")

    const user= await User.findByIdAndUpdate(req.user?._id,
        {
            $set :{
                fullname,
                email:email
            }
        },
        {new:true}).select("-password")


    return res.status(200)
    .json(new APIResponse(200, user,"Account details are updated successfully"))

})

const updateUserAvatar =asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.files?.path
    if(!avatarLocalPath) throw new APIerror(404, "Avatar file is missing")

    const avatar= await uploadOnCloudinary(avatarLocalPath)

    if(!avatar) throw new APIerror(501,"Something went wrong uploading avatar")

    const user =await user.findByIdAndUpdate(req.user?._id,
        
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}).select("-password")

    return res.status(200)
    .json(new APIResponse (200, user, "Avatar updated successfully"))


})

const updateUserCoverImage =asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.files?.path
    if(!coverImageLocalPath) throw new APIResponseError(404, "Cover Image file is missing")

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage) throw new APIResponseError(501,"Something went wrong uploading coverImage")

    const user =await user.findByIdAndUpdate(req.user?._id,
        
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new:true}).select("-password")

    return res.status(200)
    .json(new APIResponse (200, user, "Cover Image updated successfully"))


})

const getUserChannelProfile= asyncHandler(async (req,res)=>{

    const {username}=req.params
    if(!username?.trim()) throw new APIerror(400,"Username is missing")

    const channel= await User.aggegator([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreingField:"channel",
                as:"subscribers"
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreingField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubcribedToCount:{
                    $size:"$subscribedTo"
                }
            },
            isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        },
        {
            $project:{
                fullname:1,
                username:1,
                subscribersCount:1,
                channelsSubcribedToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1
            }
        }
    ])

    //Aggreagate returns array of Object(Values)
    console.log(channel)
    if(!channel?.length) throw APIerror(404,"Channel doesn't exists")

    return res
    .status(200)
    .json(
        new APIResponse(200,channel[0],"User channel fetched Succssfully")
    )
})

const getWatchHistory=asyncHandler(async(req,res)=>{
    const user=await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },{
            $lookup:{
                from:"videos",
                localField:"watchHistroy",
                foreingField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            form:"users",
                            localFiled:"owner",
                            foreingField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            user[0].watchHistory,
            "Watch Historym fetched Successfully"
        )
    )
})
export { registerUser, 
        loginUser,
        logoutUser,
        refreshAccessToken,
        changeUserPassword,
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
    } 
