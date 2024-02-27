import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {APIerror} from "../utils/APIerror.js"
import {APIResponse} from "../utils/APIResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {Video} from "../models/video.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} =req.params
    const user= req.user
    const {content}=req.body

    const video=await Video.findById(videoId)
    if(!video) throw new APIerror (500, "something went wrong while fetching video details")

    const comment=await Comment.create(
        {
            content,
            video,
            owner:user
        }
    )

    if(!comment) throw new APIerror(500,"Something went wrong while adding comments")

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            comment,
            "Comment Added Successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}= req.params
    const {content} =req.body

    const updatedComment=await Comment.findByIdAndUpdate(commentId,
        {
            content
        },
        {
            new:true
        } 
        )

    if(!updatedComment) throw new APIerror(200,"Something went wrong while updating comment")

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    )
    
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
