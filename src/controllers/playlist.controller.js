import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id; // Assuming user ID is in the JWT token

    // Validate playlist data
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    // Create a new playlist
    const playlist = new Playlist({
        name,
        description,
        owner: userId,
    });

    await playlist.save();

    return res.status(201).json({
        status: 'success',
        message: 'Playlist created successfully',
        playlist,
    });
});

// Get all playlists for a specific user
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check if userId is valid
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Get playlists created by the user
    const playlists = await Playlist.find({ owner: userId });

    if (playlists.length === 0) {
        return res.status(404).json({
            status: 'error',
            message: 'No playlists found for this user',
        });
    }

    return res.status(200).json({
        status: 'success',
        playlists,
    });
});

// Get a playlist by its ID
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Check if playlistId is valid
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Get playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json({
        status: 'success',
        playlist,
    });
});

// Add a video to a playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;

    // Check if playlistId and videoId are valid
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    // Find the playlist and update it
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Add the video to the playlist if not already present
    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    return res.status(200).json({
        status: 'success',
        message: 'Video added to playlist',
        playlist,
    });
});

// Remove a video from a playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;

    // Check if playlistId and videoId are valid
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID");
    }

    // Find the playlist and update it
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Remove the video from the playlist if it exists
    playlist.videos = playlist.videos.filter(id => !id.equals(videoId));
    await playlist.save();

    return res.status(200).json({
        status: 'success',
        message: 'Video removed from playlist',
        playlist,
    });
});

// Delete a playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Check if playlistId is valid
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Find and delete the playlist
    const playlist = await Playlist.findByIdAndDelete(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json({
        status: 'success',
        message: 'Playlist deleted successfully',
    });
});

// Update playlist details
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Check if playlistId is valid
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Find the playlist and update it
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json({
        status: 'success',
        message: 'Playlist updated successfully',
        playlist,
    });
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
