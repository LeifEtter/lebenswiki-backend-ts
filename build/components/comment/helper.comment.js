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
exports.convertCommentForResponse = void 0;
const type_comment_1 = require("./type.comment");
const helpers_user_1 = require("../user/helpers.user");
const convertCommentForResponse = ({ comment, userId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const voteCount = comment.User_commentUpVote.length - comment.User_commentDownVote.length;
    let vote;
    if (comment.User_commentUpVote.filter((e) => e.id == userId)) {
        vote = type_comment_1.Vote.UPVOTE;
    }
    else if (comment.User_commentDownVote.filter((e) => e.id == userId)) {
        vote = type_comment_1.Vote.DOWNVOTE;
    }
    else {
        vote = type_comment_1.Vote.NO_VOTE;
    }
    return {
        id: comment.id,
        content: comment.commentResponse,
        creationDate: comment.creationDate,
        usersVote: vote,
        voteCount: voteCount,
        creator: yield (0, helpers_user_1.convertUserForResponse)(comment.User_Comment_creatorIdToUser),
    };
});
exports.convertCommentForResponse = convertCommentForResponse;
