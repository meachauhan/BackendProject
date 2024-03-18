import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
// import { ApiError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/APIResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user;
  const playlist = await Playlist.create({
    name,
    description,
    owner: user?._id,
  });

  return res
    .status(201)
    .json(new APIResponse(201, playlist, "Playlist Created Sucessfully"));
  //   TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  console.log("Gettting Playlist");
  const user = await User.findById(userId);
  const playlists = await Playlist.find({ owner: user._id });
  return res
    .status(200)
    .json(new APIResponse(200, playlists, "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  const playlist = await Playlist.findById(playlistId);

  return res
    .status(200)
    .json(new APIResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const video = await Video.findById(videoId);
  const newplaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: video },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .json(new APIResponse(200, newplaylist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const newplaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    {
      new: true,
    },
  );
  return res
    .status(200)
    .json(new APIResponse(200, newplaylist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
