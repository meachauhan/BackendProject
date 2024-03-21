import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.model.js";
import { Subscription } from "../models/subscriptions.models.js";
import { APIResponse } from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const user = req.user;
  let subscribersCount = await Subscription.aggregate([
    {
      $match: {
        channel: user._id,
      },
    },
    {
      $count: "totalSubscriber",
    },
  ]);
  if (!subscribersCount.hasOwnProperty("totalSubscriber")) {
    subscribersCount = {
      totalSubscriber: 0,
    };
  }
  console.log(user?._id);

  let videoCount = await Video.find({ owner: user?._id }).count();

  console.log(videoCount);

  let likesCount = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $addFields: {
        videoDetails: {
          $first: "$videoDetails",
        },
      },
    },
    {
      $match: {
        "videoDetails.owner": user._id,
      },
    },
    {
      $count: "totalLikes",
    },
  ]);

  console.log(likesCount);

  const stats = {
    totalVideos: videoCount,
    totalSubscriber: subscribersCount.totalSubscriber,
    totalLikes: likesCount[0].totalLikes,
  };
  return res
    .status(200)
    .json(new APIResponse(200, stats, "Channel Details Fetched Successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const user = req.user;

  const videos = await Video.find({ owner: user?._id });
  return res
    .status(200)
    .json(new APIResponse(200, videos, "Channel sVideos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
