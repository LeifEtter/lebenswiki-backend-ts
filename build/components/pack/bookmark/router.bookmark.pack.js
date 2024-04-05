"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const authentication_middleware_1 = __importDefault(require("../../../middleware/authentication.middleware"));
const controller_bookmark_pack_1 = require("./controller.bookmark.pack");
const authorization_middleware_1 = __importDefault(require("../../../middleware/authorization.middleware"));
const router = (0, express_1.Router)();
router.route("/create/:id").patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, controller_bookmark_pack_1.bookmarkPack);
router
    .route("/remove/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, controller_bookmark_pack_1.removeBookmarkFromPack);
router.route("/").get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_bookmark_pack_1.getBookmarkedPacks);
exports.default = router;
