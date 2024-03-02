/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv = require("dotenv");
dotenv.config();
import express = require("express");
// import cors = require("cors");
import bodyParser = require("body-parser");
import https = require("https");
import fs = require("fs");
import userRouter from "./components/user/router.user";
import packRouter from "./components/pack/router.pack";
import blockRouter from "./components/block/router.block";
import commentRouter from "./components/comment/router.comment";
import categoryRouter from "./components/category/router.category";
import imageRouter from "./components/image/router.image";
import shortRouter from "./components/short/router.short";
import feedbackRouter from "./components/feedback/router.feedback";
import db = require("./database/database");
import path = require("path");
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
app.get("/view/deleteAccount", (req, res) => {
  res.render("a");
});
app.use("/user", userRouter);
app.use("/pack", packRouter);
app.use("/block", blockRouter);
app.use("/comment", commentRouter);
app.use("/category", categoryRouter);
app.use("/image", imageRouter);
app.use("/short", shortRouter);
app.use("/feedback", feedbackRouter);
// app.use(cors(corsOptionsDelegate));

async function main() {
  try {
    if (!process.env.JWT_SECRET) {
      console.log("Please set a JWT_SECRET=[RANDOM STRING] in .env");
      return;
    }

    const port: number | undefined = parseInt(process.env.PORT ?? "");
    if (!port) {
      console.log("Please set a PORT=[PORT] in .env");
      return;
    } else {
      console.log(`Using Port = ${port}`);
    }

    const anonUser = await db.user.findUnique({
      where: { email: "anonymous@lebenswiki.com" },
      include: {
        role: true,
      },
    });
    if (
      !anonUser ||
      anonUser.email != "anonymous@lebenswiki.com" ||
      anonUser.roleId != 1
    ) {
      console.log(
        "Please add a anonymous user, and connect him with Role id=1, and/or make sure he has the following data:",
      );
      console.log("email: anonymous@lebenswiki.com");
      console.log("The other fields can be defined as anything you want.");
      return;
    }

    const environment: string | undefined = process.env.ENV;
    if (environment == "PRODUCTION") {
      const options: https.ServerOptions = {
        key: fs.readFileSync(
          "/etc/letsencrypt/live/api.lebenswiki.com/privkey.pem",
        ),
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/api.lebenswiki.com/fullchain.pem",
        ),
      };
      const server: https.Server = https.createServer(options, app);
      server.on("uncaughtException", (err) => {
        console.log(err);
      });
      server.listen(port, (): void => {
        console.log(`Server started on port = ${port}`);
      });
    } else if (environment == "DEVELOPMENT") {
      app.listen(port, () => {
        console.log(`=================================`);
        console.log("Starting Node in Local Dev Mode");
        console.log(`🚀 App listening on the port ${port}`);
        console.log(`=================================`);
      });
    } else {
      console.log("Please define ENV=[PRODUCTION/DEVELOPMENT] in .env");
      return;
    }
  } catch (err) {
    console.log(err);
  }
}

main();
