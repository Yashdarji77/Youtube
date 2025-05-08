import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription for a user to a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user.id; // Assuming the subscriber ID is in the JWT token

    // Check if channelId is valid
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check if the subscriber is trying to subscribe to their own channel
    if (channelId === subscriberId) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if (existingSubscription) {
        // If subscription exists, unsubscribe (delete subscription)
        await existingSubscription.remove();
        return res.status(200).json({
            status: "success",
            message: "Unsubscribed from channel",
        });
    } else {
        // If subscription doesn't exist, subscribe (create new subscription)
        const subscription = new Subscription({
            subscriber: subscriberId,
            channel: channelId,
        });

        await subscription.save();

        return res.status(200).json({
            status: "success",
            message: "Subscribed to channel",
            subscription,
        });
    }
});

// Get all subscribers for a specific channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Check if channelId is valid
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Get all subscribers for the channel
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "name email") // Populate subscriber details
        .exec();

    return res.status(200).json({
        status: "success",
        subscribers: subscribers.map(sub => sub.subscriber), // Return only the subscriber details
    });
});

// Get all channels to which a user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Check if subscriberId is valid
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // Get all channels the user is subscribed to
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name email") // Populate channel details
        .exec();

    return res.status(200).json({
        status: "success",
        channels: subscriptions.map(sub => sub.channel), // Return only the channel details
    });
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};
