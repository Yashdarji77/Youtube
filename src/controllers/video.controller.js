import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Assuming cloudinary upload utility exists

// Get all videos with pagination, filtering, and sorting
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const filters = {};
  if (query) {
    filters.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId) {
    filters.owner = userId;
  }

  const options = {
    page,
    limit,
    sort: { [sortBy]: sortType === "desc" ? -1 : 1 },
  };

  const videos = await Video.paginate(filters, options);

  return res.status(200).json({
    status: "success",
    data: videos,
  });
});

// Publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoFile, thumbnail } = req.files;

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  // Upload the video and thumbnail to Cloudinary
  const videoUrl = await uploadOnCloudinary(videoFile[0].path, "video");
  const thumbnailUrl = await uploadOnCloudinary(thumbnail[0].path, "image");

  const video = new Video({
    title,
    description,
    videoFile: videoUrl,
    thumbnail: thumbnailUrl,
    duration: req.body.duration, // Assuming duration is passed in the body
    owner: req.user.id, // Assuming user ID is available in the JWT token
  });

  await video.save();

  return res.status(201).json({
    status: "success",
    message: "Video published successfully",
    video,
  });
});

// Get a video by its ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate("owner", "username");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json({
    status: "success",
    video,
  });
});

// Update video details (title, description, or thumbnail)
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user.id) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  // Update video fields
  video.title = title || video.title;
  video.description = description || video.description;

  // If thumbnail is provided, upload it
  if (req.file) {
    video.thumbnail = await uploadOnCloudinary(req.file.path, "image");
  }

  await video.save();

  return res.status(200).json({
    status: "success",
    message: "Video updated successfully",
    video,
  });
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user.id) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await video.remove();

  return res.status(200).json({
    status: "success",
    message: "Video deleted successfully",
  });
});

// Toggle video publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Toggle the isPublished status
  video.isPublished = !video.isPublished;

  await video.save();

  return res.status(200).json({
    status: "success",
    message: `Video publish status toggled to ${video.isPublished ? "published" : "unpublished"}`,
    video,
  });
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
