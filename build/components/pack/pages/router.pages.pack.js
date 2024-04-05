"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = __importDefault(require("../../../middleware/authentication.middleware"));
const authorization_middleware_1 = __importDefault(require("../../../middleware/authorization.middleware"));
const controller_pages_pack_1 = require("./controller.pages.pack");
const multer = require("multer");
const upload = multer();
const router = (0, express_1.Router)({ mergeParams: true });
router
    .route("/item/:itemId/uploadImage")
    .post(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), upload.single("image"), controller_pages_pack_1.uploadItemImage);
router.route("/save").put(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_pages_pack_1.updatePages);
exports.default = router;
