"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-unused-vars */
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
// import cors = require("cors");
const bodyParser = require("body-parser");
const https = require("https");
const fs = require("fs");
const router_user_1 = __importDefault(require("./components/user/router.user"));
const router_pack_1 = __importDefault(require("./components/pack/router.pack"));
const router_block_1 = __importDefault(require("./components/block/router.block"));
const router_comment_1 = __importDefault(require("./components/comment/router.comment"));
const router_category_1 = __importDefault(require("./components/category/router.category"));
const router_image_1 = __importDefault(require("./components/image/router.image"));
const router_short_1 = __importDefault(require("./components/short/router.short"));
const router_feedback_1 = __importDefault(require("./components/feedback/router.feedback"));
const db = require("./database/database");
// import corsOptionsDelegate = require("./config/cors.config");
const app = express();
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.route("/test").get((req, res) => {
    return res.status(200).send({ message: "Working" });
});
app.use("/user", router_user_1.default);
app.use("/pack", router_pack_1.default);
app.use("/block", router_block_1.default);
app.use("/comment", router_comment_1.default);
app.use("/category", router_category_1.default);
app.use("/image", router_image_1.default);
app.use("/short", router_short_1.default);
app.use("/feedback", router_feedback_1.default);
// app.use(cors(corsOptionsDelegate));
function main() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!process.env.JWT_SECRET) {
                console.log("Please set a JWT_SECRET=[RANDOM STRING] in .env");
                return;
            }
            const port = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "");
            if (!port) {
                console.log("Please set a PORT=[PORT] in .env");
                return;
            }
            else {
                console.log(`Using Port = ${port}`);
            }
            const anonUser = yield db.user.findUnique({
                where: { email: "anonymous@lebenswiki.com" },
                include: {
                    role: true,
                },
            });
            if (!anonUser ||
                anonUser.email != "anonymous@lebenswiki.com" ||
                anonUser.roleId != 1) {
                console.log("Please add a anonymous user, and connect him with Role id=1, and/or make sure he has the following data:");
                console.log("email: anonymous@lebenswiki.com");
                console.log("The other fields can be defined as anything you want.");
                return;
            }
            const environment = process.env.ENV;
            if (environment == "PRODUCTION") {
                const options = {
                    key: fs.readFileSync("/etc/letsencrypt/live/api.lebenswiki.com/privkey.pem"),
                    cert: fs.readFileSync("/etc/letsencrypt/live/api.lebenswiki.com/fullchain.pem"),
                };
                const server = https.createServer(options, app);
                server.on("uncaughtException", (err) => {
                    console.log(err);
                });
                server.listen(port, () => {
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
            }
            else {
                console.log("Please define ENV=[PRODUCTION/DEVELOPMENT] in .env");
                return;
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
main();
