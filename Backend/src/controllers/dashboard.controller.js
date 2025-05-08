import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    console.log("Fetching channel stats for user:", userId);

    const totalVideos = await Video.countDocuments({ owner: userId });
    const totalViewsAgg = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" },
            },
        },
    ]);

    const totalSubscribers = await Subscription.countDocuments({ channel: userId });

    const totalLikes = await Like.countDocuments({ likeableModel: "Video", likeableId: { $in: await Video.find({ owner: userId }).distinct("_id") } });

    const stats = {
        totalVideos,
        totalViews: totalViewsAgg[0]?.totalViews || 0,
        totalSubscribers,
        totalLikes,
    };

    console.log("Channel stats:", stats);

    return res.status(200).json(new ApiResponse(200, stats, "Channel statistics fetched successfully."));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    console.log("Fetching videos for user:", userId);

    const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 });

    console.log(`Found ${videos.length} videos.`);

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully."));
});

export {
    getChannelStats,
    getChannelVideos,
};
