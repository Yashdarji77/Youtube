import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper function to toggle a like
const toggleLike = async (model, id, userId) => {
    // Check if the object ID is valid
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid Object ID");
    }

    // Check if the like already exists for the user
    const existingLike = await Like.findOne({ 
        [model]: id, 
        likedBy: userId 
    });

    if (existingLike) {
        // If the like exists, remove it
        await Like.deleteOne({ 
            [model]: id, 
            likedBy: userId 
        });
        return { liked: false };
    } else {
        // Otherwise, create a new like
        const like = new Like({
            [model]: id,
            likedBy: userId,
        });
        await like.save();
        return { liked: true };
    }
};

// Toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id; // Assuming you have user id from JWT

    const result = await toggleLike('video', videoId, userId);
    
    return res.status(200).json({
        status: 'success',
        message: result.liked ? 'Liked video' : 'Unliked video',
        liked: result.liked,
    });
});

// Toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id; // Assuming you have user id from JWT

    const result = await toggleLike('comment', commentId, userId);

    return res.status(200).json({
        status: 'success',
        message: result.liked ? 'Liked comment' : 'Unliked comment',
        liked: result.liked,
    });
});

// Toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user.id; // Assuming you have user id from JWT

    const result = await toggleLike('tweet', tweetId, userId);

    return res.status(200).json({
        status: 'success',
        message: result.liked ? 'Liked tweet' : 'Unliked tweet',
        liked: result.liked,
    });
});

// Get all liked videos for a user
const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id; // Assuming you have user id from JWT

    const likedVideos = await Like.find({ likedBy: userId }).populate('video');
    
    return res.status(200).json({
        status: 'success',
        likedVideos,
    });
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
