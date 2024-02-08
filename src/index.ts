/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv = require("dotenv");
dotenv.config();
import express = require("express");
import cors = require("cors");
import bodyParser = require("body-parser");
import https = require("https");
import fs = require("fs");
// import corsOptionsDelegate = require("./config/cors.config");

const app = express();
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.route("/test").get((req, res: express.Response) => {
  return res.status(200).send({ message: "Working" });
});
// app.use(cors(corsOptionsDelegate));

function main() {
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

    const environment: string | undefined = process.env.ENV;
    if (environment == "PRODUCTION") {
      const options: https.ServerOptions = {
        key: fs.readFileSync(
          "/etc/letsencrypt/live/api.lebenswiki.com/privkey.pem"
        ),
        cert: fs.readFileSync(
          "/etc/letsencrypt/live/api.lebenswiki.com/fullchain.pem"
        ),
      };
      const server: https.Server = https.createServer(options, app);
      server.on("uncaughtException", (err) => {
        console.log(err);
      });
      server.listen(port, (): void => {
        console.log(`Server started on port = ${port}`);
      });
    }
    if (environment == "DEVELOPMENT") {
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
