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
    console.log(req.user) //User forwareded from jwtVerification Middleware
    console.log(req.files)
    const videoLocalFilePath=req.files?.videoFile[0]?.path
    const thumbnailImagePath=req.files?.thumbnail[0]?.path
    if(!videoLocalFilePath && !thumbnail) throw new APIerror(404,"Please give Video File")
    console.log(videoLocalFilePath, thumbnailImagePath)
   
    const uploadedVideo=await uploadOnCloudinary(videoLocalFilePath)
    const uploadedThumbnail=await uploadOnCloudinary(thumbnailImagePath)

    if(!uploadedVideo && !uploadedThumbnail) throw new APIerror("Video and Thumbnail required")

    console.log(uploadedVideo)

    const video=await Video.create(
        {
            title,
            description,
            videoFile:uploadedVideo.url,
            thumbnail:uploadedThumbnail.url,
            duration:uploadedVideo.duration,
            owner:req.user
        }
    )

    if(!video) throw new APIerror(500,"Something went Wrong while uploading the Video")

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            video,
            "Video uploaded successfully"
        )
    )
    



})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } =req.params
    //TODO: get video by id
     
    const video=await Video.findById(videoId)
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
    const thumbnailImagePath=req.file?.path
    let thumbnail
    if(thumbnailImagePath){
        thumbnail= await uploadOnCloudinary(thumbnailImagePath)
        if(!thumbnail) throw new APIerror(501,"something went wrong while updating thumbnail")

    }

    let {title, description}=req.body

    const video=await Video.findById(videoId)

    title= title || video.title
    description=description || video.description
    
    const updateVideo=await Video.findByIdAndUpdate(videoId,
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

     if(!updateVideo) throw new APIerror(500,"Something went wrong while updating thumbnail")
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
    const deletedVideo= await Video.findByIdAndDelete(videoId)
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
    const video=await Video.findById(videoId)
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
