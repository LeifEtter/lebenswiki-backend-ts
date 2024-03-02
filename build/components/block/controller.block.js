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
exports.getMyBlocks = exports.blockUser = exports.removeBlock = void 0;
const database_1 = __importDefault(require("../../database/database"));
const helper_error_1 = require("../error/helper.error");
const removeBlock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userToUnblockId = res.locals.id;
        const blocked = yield database_1.default.block.findFirst({
            where: {
                blockedId: userToUnblockId,
                blockerId: res.locals.user.id,
            },
        });
        if (!blocked) {
            return res.status(404).send({
                id: 10,
                message: "Couldn't unblock user, you may have not blocked him",
            });
        }
        else {
            yield database_1.default.block.deleteMany({
                where: {
                    blockedId: userToUnblockId,
                    blockerId: res.locals.user.id,
                },
            });
            return res.status(201).send({
                message: `Successfully unblocked user with ID = ${userToUnblockId}`,
            });
        }
    }
    catch (error) {
        return res.status(501).send({
            id: 9,
            message: "You were unable to block the user, in case it's urgent please contact us immediately",
        });
    }
});
exports.removeBlock = removeBlock;
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (res.locals.id == res.locals.user.id) {
            return res
                .status(400)
                .send({ id: 12, message: "You can't block yourself" });
        }
        const alreadyBlocked = yield database_1.default.block.findFirst({
            where: {
                blockedId: res.locals.id,
                blockerId: res.locals.user.id,
            },
        });
        if (alreadyBlocked) {
            return res
                .status(400)
                .send({ id: 11, message: "You have already blocked this user" });
        }
        else {
            yield database_1.default.block.create({
                data: {
                    reason: req.body.reason,
                    blockedId: res.locals.id,
                    blockerId: res.locals.user.id,
                },
            });
            return res.status(201).send({
                message: `Successfully blocked user with ID = ${res.locals.id}`,
            });
        }
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, rName: "User", res });
    }
});
exports.blockUser = blockUser;
const getMyBlocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blocks = yield database_1.default.block.findMany({
            where: {
                blockerId: res.locals.user.id,
            },
            include: {
                User_Block_blockedIdToUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        const myBlocks = blocks.map((block) => ({
            userName: block.User_Block_blockedIdToUser.id,
            userId: block.User_Block_blockedIdToUser.name,
        }));
        return res.status(200).send(myBlocks);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({
            res,
            error,
            rName: "Blocked User",
        });
    }
});
exports.getMyBlocks = getMyBlocks;
