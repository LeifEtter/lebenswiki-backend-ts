"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const controller_user_1 = require("./controller.user");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const controller_image_1 = require("../image/controller.image");
const authorization_middleware_1 = __importDefault(require("../../middleware/authorization.middleware"));
const router = (0, express_1.Router)();
router.route("/checkToken").get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_user_1.checkToken);
router.route("/register").post((0, express_validator_1.body)(["email", "password", "name", "biography"]).exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    msg: "Please make sure you are passing an email, password, name and biography.",
}), controller_user_1.register);
router.route("/login").post((0, express_validator_1.body)(["email", "password"]).exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    msg: "Please make sure you are passing an email and a password.",
}), controller_user_1.login);
router.route("/profile/update").patch(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_user_1.updateProfile);
router.route("/profile").get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_user_1.showProfile);
router
    .route("/self/delete")
    .delete(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_image_1.deleteAvatar);
router.route("/:id").get(validation_middleware_1.checkValidId, authentication_middleware_1.default, controller_user_1.getUsersProfile);
exports.default = router;
