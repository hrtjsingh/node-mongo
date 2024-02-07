import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

const isAuthorized = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken
        if (!token) {
            throw new ApiError(401, "unauthorized user")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) throw new ApiError(401, "Access token is not valid")
            return decoded
        })

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "user not found")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "not valid user")
    }
})

export { isAuthorized }