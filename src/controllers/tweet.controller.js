import mongoose, { isValidObjectId, ObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.models.js"
import asyncHandler from "../utils/asyncHandler.js"
import { APIerror } from "../utils/APIerror.js"
import { APIResponse } from "../utils/APIResponse.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} =req.body
    if(!content) throw new APIerror("Please enter sometext in your tweet")
    const user=req.user

    const tweet=await Tweet.create(
        {
            content,
            owner:user
        }
    )

    if(!tweet) throw new APIerror(500,"Something went wrong while creating tweet")

    return res
    .status(200)
    .json(
        new APIResponse(200, tweet, "Tweet created Successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
   
    const {userId} = req.params
    console.log(userId)
    const tweets= await Tweet.aggregate(
        [
            {
                $match:{
                owner:new mongoose.Types.ObjectId(userId)
            },
            },
                      
        ]
    )

    if(!tweets) throw new APIerror(500,"User don't have any tweets")

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            tweets,
            "Tweets fetched successfully"
        )
    )

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} =req.params
    const {content}=req.body

    const updatedTweet= await Tweet.findByIdAndUpdate(tweetId,
        {
            content
        },
        {
            new:true
        }
    )
    if(!updatedTweet) throw new APIerror(500,"Something went wrong while updating the tweet")

    return res
    .status(200)
    .json(
        new APIResponse(
            200,
            updatedTweet,
            "Tweet updated sucessfully"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} =req.params

    const deletedTweet= await Tweet.findByIdAndDelete(tweetId)
    if(!deletedTweet) throw new APIerror(500, "Something went wrong while deleteing the tweet")

    return res
    .status(200)
    .json(
        new APIResponse(200,deletedTweet,"Tweet Deleted Successfully")
    )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
