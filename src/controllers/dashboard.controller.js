import mongoose from "mongoose";
import { Video } from "../models/video.models.js";

import { APIResponse } from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
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
