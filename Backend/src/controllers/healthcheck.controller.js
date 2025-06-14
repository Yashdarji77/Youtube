import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    return res.status(200).json({
        status: 'OK',
        message: 'Service is running smoothly',
    });
});

export { healthcheck };
