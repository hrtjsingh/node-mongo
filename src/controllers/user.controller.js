import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken';

const options = {
    httpOnly: true,
    secure: true
}


const generateAccessAndRefershToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accesstoken = await user.generateAccessToken()
        const refreshtoken = await user.generateRefreshToken()
        await User.findByIdAndUpdate(user._id, { $set: { refreshToken: refreshtoken } }, { new: true })
        return { accesstoken, refreshtoken }
    } catch (error) {
        throw new ApiError(500, `somthing went wrong in generateAccessAndRefershToken${error}`)
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body

    if ([fullName, email, username, password].some(item => item.trim() === "")) {
        throw new ApiError(400, "All is required")
    }
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "user exists")
    }
    const avatarPath = req.files?.avatar[0]?.path || ""
    const coverPath = req.files?.coverImage[0]?.path

    if (!avatarPath) {
        throw new ApiError(400, "avatar required")
    }

    const avatar = await uploadOnCloudinary(avatarPath)
    const cover = await uploadOnCloudinary(coverPath)

    if (!avatar) {
        throw new ApiError(400, "avatar required after upload")
    }

    const user = await User.create({
        userName: username,
        email,
        fullName,
        avatar: avatar.url,
        coverImage: cover?.url || "",
        password: password.toLowerCase(),
        refreshToken: ""
    })

    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!userCreated) {
        throw new ApiError(400, "user not created")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "user created successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!email && !username) {
        throw new ApiError(400, "username and password is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(400, "user not found")
    }

    const isvalidPass = await user.isPasswordCorrect(password)
    if (!isvalidPass) {
        throw new ApiError(401, "password inccorect")
    }
    const { refreshtoken, accesstoken } = await generateAccessAndRefershToken(user._id)
    const loggedData = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
        .cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedData, accesstoken, refreshtoken
            },
                "user Logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const { _id } = req.user
    await User.findByIdAndUpdate(_id, { $set: { refreshToken: "" } }, { new: true })

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logout"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req?.cookies?.refreshToken
    if (!token) {
        throw new ApiError(401, "unauthrized user")
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, function (err, decoded) {
        if (err) throw new ApiError(401, "Access token is not valid")
        return decoded
    })
    const user = await User.findById(decodedToken._id)
    if (user.refreshToken !== token) {
        throw new ApiError(401, "Token not valid")
    }

    const { refreshtoken, accesstoken } = await generateAccessAndRefershToken(user._id)

    return res.status(200)
        .cookie("accessToken", accesstoken, options)
        .cookie("refreshToken", refreshtoken, options)
        .json(
            new ApiResponse(
                200, {
                refreshtoken
            },
                "refreshToken updated"
            )
        )

})

export { registerUser, loginUser, logoutUser, refreshAccessToken } 