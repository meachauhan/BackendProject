import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { APIerror } from "../utils/APIerror.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) throw new APIerror(401,`Invalid refresh token`)

    const decodedToken=jwt.verify(incomingRefreshToken,process.env.ACCESS_REFRESH_SECRET)

    const user= await User.findById(decodedToken?._id)

    if(!user) throw new APIerror(401,`Invalid refresh token`)

    const tweetContent = req.body.content

    if(!tweetContent?.trim()) throw new APIerror(400,"Tweet should not be empty")

    const tweet=await Tweet.create(
        {
            
        }
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
