import { Router } from "express";
import { registerUser, loginUser, logoutUser, changeUserPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import {refreshAccessToken } from "../controllers/user.controller.js";
import {verifyJWT} from "../middleware/auth.middleware.js"
import { verify } from "jsonwebtoken";

const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)


//secured routes

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/changePassword").post(verifyJWT,changeUserPassword)

router.route("/currentUest").get(verifyJWT,getCurrentUser)

router.route("/updateAccount").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/coverImage").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)
export default router