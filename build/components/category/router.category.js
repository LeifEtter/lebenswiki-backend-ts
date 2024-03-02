"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_category_1 = require("./controller.category");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const router = (0, express_1.Router)();
router
    .route("/packsAndShorts")
    .get(authentication_middleware_1.default, controller_category_1.getAllPacksAndShortsWithCategories);
router.route("/").get(controller_category_1.getAllCategories);
router.route("/:id/packs").get(validation_middleware_1.checkValidId, authentication_middleware_1.default, controller_category_1.getPacksForCategory);
// router
//   .route("/:id")
//   .get(checkValidId, authenticate, getPacksAndShortsForCategory);
router
    .route("/:id/shorts")
    .get(validation_middleware_1.checkValidId, authentication_middleware_1.default, controller_category_1.getShortsForCategory);
// TODO: Add Routes for Creating, Deleting and Updating, as well as getting for shorts
exports.default = router;
