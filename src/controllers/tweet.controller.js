import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new tweet
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const ownerId = req.user.id; // Assuming the user ID is available in the JWT token

    if (!content) {
        throw new ApiError(400, "Content is required to create a tweet");
    }

    const tweet = new Tweet({
        content,
        owner: ownerId
    });

    await tweet.save();

    return res.status(201).json({
        status: "success",
        message: "Tweet created successfully",
        tweet
    });
});

// Get all tweets of a user
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Fetch all tweets belonging to the user
    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
        status: "success",
        tweets
    });
});

// Update an existing tweet
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check if the tweet exists
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the logged-in user is the owner of the tweet
    if (tweet.owner.toString() !== req.user.id) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content || tweet.content; // Update content if provided

    await tweet.save();

    return res.status(200).json({
        status: "success",
        message: "Tweet updated successfully",
        tweet
    });
});

// Delete a tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check if the tweet exists
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check if the logged-in user is the owner of the tweet
    if (tweet.owner.toString() !== req.user.id) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await tweet.remove();

    return res.status(200).json({
        status: "success",
        message: "Tweet deleted successfully"
    });
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};
