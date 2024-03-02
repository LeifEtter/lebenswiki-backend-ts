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
const express_1 = require("express");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const express_validator_1 = require("express-validator");
const controller_user_1 = require("./controller.user");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const controller_image_1 = require("../image/controller.image");
const authorization_middleware_1 = __importDefault(require("../../middleware/authorization.middleware"));
const database_1 = __importDefault(require("../../database/database"));
const bcrypt = require("bcrypt");
const router = (0, express_1.Router)();
router.route("/checkToken").get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_user_1.checkToken);
router.route("/register").post((0, express_validator_1.body)("email").exists().escape().isEmail(), (0, express_validator_1.body)("password").exists().escape().isStrongPassword({
    minSymbols: 1,
    minUppercase: 1,
    minLength: 6,
}), (0, express_validator_1.body)("name").exists().escape().isString().isLength({ min: 3 }), (0, express_validator_1.body)("biography").escape().isString(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "User",
    msg: "Please make sure you are passing an email, password, name and biography.",
}), controller_user_1.register);
router.route("/login").post((0, express_validator_1.body)(["email", "password"]).exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "User",
    msg: "Please make sure you are passing an email and a password.",
}), controller_user_1.login);
router.route("/profile/update").patch(authentication_middleware_1.default, (0, express_validator_1.body)("email").escape().isEmail(), (0, express_validator_1.body)("name").escape().isString().isLength({ min: 3 }), (0, express_validator_1.body)("biography").escape().isString(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "User",
    msg: "Please make sure that Email, Name and Biography are formatted correctly",
}), (0, authorization_middleware_1.default)(2), controller_user_1.updateProfile);
router.route("/profile").get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_user_1.showProfile);
router
    .route("/self/delete")
    .delete(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_image_1.deleteAvatar);
router.route("/:id").get(validation_middleware_1.checkValidId, authentication_middleware_1.default, controller_user_1.getUsersProfile);
router.route("/defaultAvatar").patch(authentication_middleware_1.default, controller_user_1.defaultAvatar);
router.route("/block/:id").post(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), (0, express_validator_1.body)("reason").exists().isString().escape(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Block",
    msg: "Please make sure to pass a 'reason' as a string.",
}), controller_user_1.blockUser);
router
    .route("/unblock/:id")
    .delete(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_user_1.unblockUser);
router.route("/delete/special").post((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.email) {
            return res.status(400).send("Please enter a valid email");
        }
        if (!req.body.password) {
            return res.status(400).send("Please enter a valid password");
        }
        const user = yield database_1.default.user.findUnique({
            where: {
                email: req.body.email,
            },
        });
        if (!user) {
            return res.status(401).send("User not found or password is invalid");
        }
        const passwordIsValid = yield bcrypt.compare(req.body.password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send("User not found or password is invalid");
        }
        if (passwordIsValid) {
            yield database_1.default.user.delete({ where: { email: req.body.email } });
            return res.status(200).send("Deleted");
        }
    }
    catch (error) {
        return res.status(501).send("Something went wrong");
    }
}));
exports.default = router;
