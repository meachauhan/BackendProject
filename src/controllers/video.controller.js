import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import asyncHandler from "../utils/asyncHandler.js"
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

    if(!incomingRefreshToken) throw new APIerror(401,`Invalid refresh token`)

    const decodedToken=jwt.verify(incomingRefreshToken,process.env.ACCESS_REFRESH_SECRET)

    const user= await User.findById(decodedToken?._id)

    if(!user) throw new APIerror(401,`Invalid refresh token`)

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
    const video=await Video.findOne(videoId)
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
    const deletedVideo= await Video.deleteOne(videoId)
    if(!deletedVideo) throw new APIerror(501,"Something went wrong while deleting the video")
    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            deletedVideo,
            "Video Deleted Successfully"
            )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video=await Video.findOne(videoId)
    if(!video) throw new APIerror(404,"Invalid Video Id")

    video.isPublished=video.isPublished ? false : true

    await video.save()

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            video.isPublished,
            "Toggle Updated Successfully"
        )
    )
    

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
