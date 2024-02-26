import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { APIerror } from "../utils/APIerror.js"
import { APIResponse } from "../utils/APIResponse.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) throw new APIResponseError(401,`Invalid refresh token`)

    const decodedToken=jwt.verify(incomingRefreshToken,process.env.ACCESS_REFRESH_SECRET)

    const user= await User.findById(decodedToken?._id)

    if(!user) throw new APIResponseError(401,`Invalid refresh token`)

    const videoLocalFilePath=req.files?.videoFile[0]?.path
    if(!videoLocalFilePath) throw new ApiError(404,"Please give Video File")
    
    let thumbnailImagePath ;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailImagePath=req.files.thumbnail[1].path
    }

    const video=await uploadOnCloudinary(videoLocalFilePath)
    const thumbnail=await uploadOnCloudinary(thumbnailImagePath)

    if(!video && !thumbnail) throw new APIerror("Video and Thumbnail required")

    console.log(video)





})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video=Video.findOne(videoId)
    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            video,

            "Video Fetched Successfully"
        )
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const thumbnailImagePath=req.files?.path
    if(thumbnailImagePath){
        const thumbnail= await uploadOnCloudinary(thumbnailImagePath)
        if(!thumbnail) throw new APIerror(501,"something went wrong while updating thumbnail")

    }

    let {title, description}=req.body

    const video=await Video.findOne(videoId)

    title= title || video.title
    description=description || video.description
    
    const updateVideo=await video.findByIdAndUpdate(videoId,
        {
            $set:{
                title: title,
                description:description,
                thumbnail:thumbnail.url

            }
        },
        {
            new:true
        }
     )
     return res
     .status(200)
     .json(
        new APIResponse(
            200,
            updateVideo,
            "Video Details updated Successfully"
        )
     )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
