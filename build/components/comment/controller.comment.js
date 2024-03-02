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
exports.removeVoteForComment = exports.upvoteComment = exports.downvoteComment = exports.reportComment = exports.deleteComment = exports.createSubcomment = exports.createCommentForPack = exports.createCommentForShort = void 0;
const database_1 = __importDefault(require("../../database/database"));
const helper_error_1 = require("../error/helper.error");
const createCommentForShort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO If necessary block user from creating comment if user is blocked, otherwise just stick to filtering comments
        const { comment } = req.body;
        const commentResult = yield database_1.default.comment.create({
            data: {
                commentResponse: comment,
                User_Comment_creatorIdToUser: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
                Short: {
                    connect: {
                        id: res.locals.id,
                    },
                },
            },
        });
        return res.status(201).send({
            message: `Commented on Short with ID = ${res.locals.id} successfully`,
            commentId: commentResult.id,
        });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, rName: "Short", error });
    }
});
exports.createCommentForShort = createCommentForShort;
const createCommentForPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // TODO If necessary block user from creating comment if user is blocked, otherwise just stick to filtering comments
        const { comment } = req.body;
        const commentResult = yield database_1.default.comment.create({
            data: {
                commentResponse: comment,
                User_Comment_creatorIdToUser: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
                Pack: {
                    connect: {
                        id: res.locals.id,
                    },
                },
            },
        });
        return res.status(201).send({
            message: `Commented on Pack with ID = ${res.locals.id} successfully`,
            commentId: commentResult.id,
        });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, rName: "Pack", error });
    }
});
exports.createCommentForPack = createCommentForPack;
const createSubcomment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield database_1.default.comment.findUniqueOrThrow({
            where: {
                id: res.locals.id,
            },
        });
        if (!comment) {
            return res.status(404).send({
                message: "Resource could not be",
            });
        }
        const commentResponse = yield database_1.default.comment.create({
            data: {
                commentResponse: req.body.comment,
                User_Comment_creatorIdToUser: {
                    connect: {
                        id: res.locals.id,
                    },
                },
            },
        });
        return res.status(201).send({ message: "Comment created successfully" });
    }
    catch (error) {
        (0, helper_error_1.handleError)({
            res,
            error,
            rName: "Subcomment",
        });
    }
});
exports.createSubcomment = createSubcomment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.comment.delete({
            where: {
                id: res.locals.id,
                creatorId: res.locals.user.id,
            },
        });
        return res
            .status(200)
            .send({ message: "Comment has been deleted successfully" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({
            error,
            res,
            rName: "Comment",
            message: "Something went wrong while deleting your comment, please contact us immediately if it needs to be removed",
        });
    }
});
exports.deleteComment = deleteComment;
const reportComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.report.create({
            data: {
                reason: req.body.reason,
                Comment: {
                    connect: {
                        id: res.locals.id,
                    },
                },
            },
        });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({
            res,
            error,
            rName: "Comment",
            message: "Failed to delete Pack, please contact support immediately if you need the pack removed or unpublished",
        });
    }
});
exports.reportComment = reportComment;
const downvoteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.comment.update({
            where: { id: res.locals.id },
            data: {
                User_commentDownVote: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
                User_commentUpVote: {
                    disconnect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res.status(200).send({ message: "Comment downvoted" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ rName: "Comment", res, error });
    }
});
exports.downvoteComment = downvoteComment;
const upvoteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.comment.update({
            where: { id: res.locals.id },
            data: {
                User_commentDownVote: {
                    disconnect: {
                        id: res.locals.user.id,
                    },
                },
                User_commentUpVote: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res.status(200).send({ message: "Comment upvoted" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ rName: "Comment", res, error });
    }
});
exports.upvoteComment = upvoteComment;
const removeVoteForComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.comment.update({
            where: { id: res.locals.id },
            data: {
                User_commentDownVote: {
                    disconnect: {
                        id: res.locals.user.id,
                    },
                },
                User_commentUpVote: {
                    disconnect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res
            .status(200)
            .send({ message: "Vote removed from comment successfully" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ rName: "Comment", res, error });
    }
});
exports.removeVoteForComment = removeVoteForComment;
