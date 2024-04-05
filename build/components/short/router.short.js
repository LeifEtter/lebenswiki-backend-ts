"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_short_1 = require("./controller.short");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const authorization_middleware_1 = __importDefault(require("../../middleware/authorization.middleware"));
const router = (0, express_1.Router)();
router.route("/").get(authentication_middleware_1.default, controller_short_1.getAllShorts);
router.route("/categorized").get(authentication_middleware_1.default, controller_short_1.getAllShortsWithCategories);
router.route("/create").post(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), (0, express_validator_1.body)("title").exists().escape().isString().isLength({ min: 10, max: 100 }), (0, express_validator_1.body)("content").exists().escape().isString().isLength({ min: 10, max: 500 }), (0, express_validator_1.body)("categories").exists().isArray(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Short",
    msg: "Please make sure you're passing 'title' and 'content' as strings.",
}), controller_short_1.createShort);
router.route("/bookmarked").get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.getBookmarkedShorts);
router
    .route("/own/published")
    .get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.getOwnPublishedShorts);
router
    .route("/own/unpublished")
    .get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.getOwnUnpublishedShorts);
router
    .route("/clap/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.clapForShort);
router
    .route("/publish/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.publishShort);
router
    .route("/unpublish/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.unpublishShort);
router
    .route("/delete/:id")
    .delete(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.deleteShort);
router
    .route("/bookmark/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.bookmarkShort);
router
    .route("/unbookmark/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_short_1.unbookmarkShort);
router.route("/report/:id").patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), (0, express_validator_1.body)("reason").exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Report",
    msg: "Please make sure you're passing a 'reason' as a string.",
}), controller_short_1.reportShort);
exports.default = router;
