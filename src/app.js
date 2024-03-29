import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
// const swaggerUI=require('swagger-ui-express')
// const swaggerfile=require('../docs/swagger-output.json')
// import {swd
const app = express();

//Basic Middleware configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credential: true,
  }),
);

app.use(express.json({ limit: "16Kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//Swagger
import swaggerUI from "swagger-ui-express";
import { specs } from "./utils/swaggerOptions.js";
// import swaggerDocument from "./utils/swagger-output.yml" assert { type: "yml" };

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

//routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import commentRouter from "./routes/comment.routes.js";
import likeRouter from "./routes/like.routes.js";
import healthcheck from "./routes/healthcheck.routes.js";
import subscription from "./routes/subscription.routes.js";
import playlist from "./routes/playlist.routes.js";
import dashboard from "./routes/dashboard.routes.js";
//routes declartion
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/healthcheck", healthcheck);
app.use("/api/v1/subscription", subscription);
app.use("/api/v1/playlist", playlist);
app.use("/api/v1/dashboard", dashboard);
// app.user('/docs',swaggerUI.serve,swaggerUI.setup(swaggerfile))

//htpps://localhost:8000/api/v1/users

export { app };
