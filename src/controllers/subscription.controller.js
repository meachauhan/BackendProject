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
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber_details",
        pipeline: [
          {
            $project: {
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber_details: {
          $first: "$subscriber_details",
        },
      },
    },
    {
      $match: {
        channel: channel?._id,
      },
    },
    {
      $addFields: {
        subscriber_fullname: "$subscriber_details.fullname",
        subscriber_avatar: "$subscriber_details.avatar",
        subscriber_id: "$subscriber",
      },
    },
    {
      $project: {
        _id: 0,
        subscriber_fullname: 1,
        subscriber_avatar: 1,
        subscriber_id: 1,
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
  const subscriber = await User.findById(subscriberId);
  const subscribedChannels = await Subscription.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel_details",
        pipeline: [
          {
            $project: {
              fullname: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel_details: {
          $first: "$channel_details",
        },
      },
    },
    {
      $match: {
        subscriber: subscriber?._id,
      },
    },
    {
      $addFields: {
        channel_fullname: "$channel_details.fullname",
        channel_avatar: "$channel_details.avatar",
        channel_id: "$channel",
      },
    },
    {
      $project: {
        _id: 0,
        channel_fullname: 1,
        channel_avatar: 1,
        channel_id: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new APIResponse(200, subscribedChannels, "Channels Fetched Successfully"),
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
