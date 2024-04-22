/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv = require("dotenv");
dotenv.config();
import express = require("express");
// import cors = require("cors");
import bodyParser = require("body-parser");
import userRouter from "./components/user/router.user";
import packRouter from "./components/pack/router.pack";
import blockRouter from "./components/block/router.block";
import commentRouter from "./components/comment/router.comment";
import categoryRouter from "./components/category/router.category";
import imageRouter from "./components/image/router.image";
import shortRouter from "./components/short/router.short";
import feedbackRouter from "./components/feedback/router.feedback";
import logRouter from "./components/log/router.log";
// import corsOptionsDelegate = require("./config/cors.config");

const app = express();
app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
app.set("views", `${__dirname}/views`);
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.route("/test").get((req, res: express.Response) => {
  return res.status(200).send({ message: "Working" });
});
app.route("/view/deleteAccount").get((req, res) => {
  res.render("deleteAccount");
});
app.use("/user", userRouter);
app.use("/pack", packRouter);
app.use("/block", blockRouter);
app.use("/comment", commentRouter);
app.use("/category", categoryRouter);
app.use("/image", imageRouter);
app.use("/short", shortRouter);
app.use("/feedback", feedbackRouter);
app.use("/log", logRouter);
// app.use(cors(corsOptionsDelegate));

export default app;
