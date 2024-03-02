"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const express_validator_1 = require("express-validator");
const controller_comment_1 = require("./controller.comment");
const authorization_middleware_1 = __importDefault(require("../../middleware/authorization.middleware"));
const router = (0, express_1.Router)();
router.route("/subcomment/:id").post(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), (0, express_validator_1.body)("comment").exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Comment",
    msg: "Make sure you are passing a 'comment' as a string.",
}), controller_comment_1.createSubcomment);
router
    .route("/delete/:id")
    .delete(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_comment_1.deleteComment);
router.route("/report/:id").post(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), (0, express_validator_1.body)("reason").exists().isString(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Comment",
    msg: "Make sure you are passing a 'reason' as a string.",
}), controller_comment_1.reportComment);
router.route("/pack/:id").post(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), (0, express_validator_1.body)("comment").exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Comment",
    msg: "Please make sure you are passing a 'comment' as a string",
}), authentication_middleware_1.default, controller_comment_1.createCommentForPack);
router.route("/short/:id").post(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), (0, express_validator_1.body)("comment").exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Comment",
    msg: "Please make sure you are passing a 'comment' as a string",
}), controller_comment_1.createCommentForShort);
router
    .route("/upvote/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_comment_1.downvoteComment);
router
    .route("/downvote/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_comment_1.upvoteComment);
router
    .route("/vote/remove/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_comment_1.removeVoteForComment);
// TODO: Implement route for getting subcomments of comment
// TODO: Show subcomment count
exports.default = router;
