import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscriptions.models.js";
// import { ApiError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const user = req.user;
  const channel = await User.findById(channelId);
  console.log(channelId);
  let subcribed = null;
  subcribed = await Subscription.aggregate([
    {
      $match: {
        subscriber: user?._id,
        channel: channel?._id,
      },
    },
  ]);
  console.log(subcribed);
  let result;
  if (subcribed.length > 0) {
    console.log("Already Subscribed");
    result = await Subscription.deleteOne({
      subscriber: user?._id,
      channel: channel?._id,
    });
  } else {
    console.log("Not Subscribed");
    result = await Subscription.create({
      channel: channel,
      subscriber: user,
    });
  }
  return res
    .status(200)
    .json(new APIResponse(200, result, "Subscription Updated Successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(channelId);
  const channel = await User.findById(channelId);
  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: channel?._id,
      },
    },
  ]);

  return res
    .status(200)
    .json(new APIResponse(200, subscribers, "Subscriber Fetched Successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  });
  return res
    .status(200)
    .json(
      new APIResponse(200, subscribedChannels, "Channels Fetched Successfully"),
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
