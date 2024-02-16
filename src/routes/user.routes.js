import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import refreshAccessToken from "../controller/user.controller.js";

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

router.route("/logout").post(verifyJWT,logoutUSer)

router.route("/refresh-token").post(refreshAccessToken)
export default router