"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_image_1 = require("./controller.image");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const multer_1 = __importDefault(require("multer"));
const authorization_middleware_1 = __importDefault(require("../../middleware/authorization.middleware"));
const upload = (0, multer_1.default)();
const router = (0, express_1.Router)();
router
    .route("/avatar/upload")
    .post(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), upload.single("avatar"), controller_image_1.uploadAvatar);
router.route("/avatar/delete").delete(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_image_1.deleteAvatar);
exports.default = router;
