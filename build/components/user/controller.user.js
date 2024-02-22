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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersProfile = exports.deleteUser = exports.showProfile = exports.updateProfile = exports.login = exports.register = exports.checkToken = void 0;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorMessages_1 = require("../../constants/errorMessages");
const controller_image_1 = require("../image/controller.image");
const helper_error_1 = require("../error/helper.error");
const db = require("../../database/database");
const helpers_pack_1 = require("../pack/helpers.pack");
const helpers_block_1 = require("../block/helpers.block");
const helpers_user_1 = require("./helpers.user");
const SALT_ROUNDS = 10;
const TWO_HOURS_IN_MILLISECONDS = 2 * 60 * 60 * 1000;
const THIRTY_DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
const checkToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db.user.findUniqueOrThrow({
            where: {
                id: res.locals.user.id,
            },
        });
        const userForResponse = yield (0, helpers_user_1.convertUserForResponse)(user);
        return res.status(200).send(userForResponse);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "User", rId: res.locals.user.id });
    }
});
exports.checkToken = checkToken;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name, biography } = req.body;
        const encryptedPassword = yield bcrypt.hash(password, SALT_ROUNDS);
        const user = yield db.user.create({
            data: {
                name: name,
                email: email,
                password: encryptedPassword,
                biography: biography,
                role: {
                    connect: { id: 2 },
                },
            },
        });
        return res.status(201).send({ message: "Registration was successful" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({
            res,
            error,
            rName: "User",
            rId: res.locals.user.id,
            message: errorMessages_1.GENERIC_REGISTRATION_ERROR,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Prevent anon login
        if (email == "anonymous@lebenswiki.com") {
            return res.status(401).send({
                message: "I'm sorry, but this email can't be used to log in.",
            });
        }
        const user = yield db.user.findUnique({ where: { email: email } });
        if (!user) {
            console.log("User not found");
            return res.status(404).send({ message: errorMessages_1.GENERIC_LOGIN_ERROR });
        }
        // Prevent anon login
        if (user.id == 0) {
            return res
                .status(401)
                .send({ message: "A token cant be issued for this account." });
        }
        const passwordValid = yield bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(404).send({ message: errorMessages_1.GENERIC_LOGIN_ERROR });
        }
        const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "30 days",
        });
        const isFirstLogin = user.isFirstLogin;
        if (isFirstLogin) {
            // await db.user.update({
            //   where: {
            //     id: user.id,
            //   },
            //   data: {
            //     isFirstLogin: false,
            //   },
            // });
        }
        res.status(200);
        //TODO Figure out how to reduce token alive time
        res.cookie("jwt_token", token, {
            secure: process.env.ENV !== "DEVELOPMENT",
            httpOnly: true,
            maxAge: THIRTY_DAYS_IN_MILLISECONDS,
        });
        return res.send(yield (0, helpers_user_1.convertUserForResponse)(user));
    }
    catch (error) {
        console.log(error);
        return res
            .status(501)
            .send({ message: "Login Failed, please try again later" });
    }
});
exports.login = login;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password, biography, oldPassword } = req.body;
        //TODO temporarily allow password change for admins
        if (password && res.locals.user.role.level < 10) {
            if (!oldPassword) {
                return res.status(401).send({
                    message: "Please supply your old password in order to reset your password.",
                });
            }
            const existingUser = yield db.user.findUniqueOrThrow({
                where: { id: res.locals.user.id },
            });
            const passwordsMatch = yield bcrypt.compare(oldPassword, existingUser === null || existingUser === void 0 ? void 0 : existingUser.password);
            if (!passwordsMatch) {
                return res
                    .status(401)
                    .send({ message: "Old password supplied doesn't match" });
            }
        }
        const encryptedPassword = yield bcrypt.hash(password, SALT_ROUNDS);
        yield db.user.update({
            where: {
                id: res.locals.user.id,
            },
            data: {
                name,
                password: encryptedPassword,
                biography,
            },
        });
        return res.status(200).send({ message: "Profile Updated" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "User", rId: 0 });
    }
});
exports.updateProfile = updateProfile;
const showProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db.user.findUniqueOrThrow({
            where: {
                id: res.locals.user.id,
            },
        });
        const userForResponse = yield (0, helpers_user_1.convertUserForResponse)(user);
        userForResponse.avatar = yield (0, controller_image_1.getSignedUrlForAvatar)(user.id);
        return res.status(200).send(user);
    }
    catch (error) {
        console.log(error);
        return res.status(501).send({
            message: "Something went wrong while trying to retrieve your account",
        });
    }
});
exports.showProfile = showProfile;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db.user.delete({ where: { id: res.locals.user.id } });
        return res.status(200).send({
            message: "Your User Account as well as all your personal information has been removed. This includes your Shorts, Packs, Up- and Downvotes, Comments, and Bookmarks. Any personal information stored in Reports you may have made was removed. To remove the rest of your information such as tracked actions used for statistical purposes, please contact us at: lebenswiki@gmail.com",
        });
    }
    catch (error) {
        (0, helper_error_1.handleError)({
            res,
            error,
            rName: "User",
            rId: res.locals.user.id,
            message: "Something went wrong while trying to delete your account, please contact us immediately.",
        });
    }
});
exports.deleteUser = deleteUser;
const getUsersProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id)).includes(res.locals.id)) {
            return res.status(400).send({
                message: "You can't view a profile of a user you have blocked",
            });
        }
        const user = yield db.user.findUniqueOrThrow({
            where: {
                id: res.locals.id,
            },
            include: {
                role: true,
            },
        });
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: { creatorId: res.locals.id, published: true },
            userId: res.locals.user.id,
            blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
        });
        return res.status(200).send({
            id: user.id,
            name: user.name,
            biography: user.biography,
            role: {
                id: user.role.id,
                name: user.role.name,
                level: user.role.accessLevel,
            },
            packs: packs,
        });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "User", rId: res.locals.id });
    }
});
exports.getUsersProfile = getUsersProfile;
// Implement Anonymous login
