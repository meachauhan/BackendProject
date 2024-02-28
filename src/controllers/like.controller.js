import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.models.js"
import { Comment } from "../models/comment.model.js"
import {APIerror} from "../utils/APIerror.js"
import {APIResponse} from "../utils/APIResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const user=req.user
    const video=await Video.findById(videoId)
    if(!video) throw new APIerror(404,"Invalid Video Id")
  
    let likeDetails=null
     likeDetails= await Like.aggregate(
        [
            {
                $match:{
                    likedBy:user?._id,
                    video:video?._id
                }
            }
        ]
    )
    console.log(likeDetails.length)
    // if(!likeDetails) throw new APIerror(500, "Something went wrong while updating likes")
    // console.log(likeDetails.isLiked)

    let result
    if(likeDetails.length>0){
        console.log("Already Liked")
         result= await Like.deleteOne({
            likedBy:user?._id,
            video:video?._id
        })
    }else{
        console.log("Not Liked")
         result=await Like.create(
            {
                likedBy:user,
                video:video
            }
        )
    }

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            result,
            "Like Updated Successfully"
        )
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const user=req.user
    const comment=await Comment.findById(commentId)
    if(!comment) throw new APIerror(404,"Invalid Comment Id")
  
    let likeDetails=null
     likeDetails= await Like.aggregate(
        [
            {
                $match:{
                    likedBy:user?._id,
                    comment:comment?._id
                }
            }
        ]
    )
    console.log(likeDetails.length)
    // if(!likeDetails) throw new APIerror(500, "Something went wrong while updating likes")
    // console.log(likeDetails.isLiked)

    let result
    if(likeDetails.length>0){
        console.log("Already Liked")
         result= await Like.deleteOne({
            likedBy:user?._id,
            comment:comment?._id
        })
    }else{
        console.log("Not Liked")
         result=await Like.create(
            {
                likedBy:user,
                comment:comment
            }
        )
    }

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            result,
            "Like Updated Successfully"
        )
    )


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}