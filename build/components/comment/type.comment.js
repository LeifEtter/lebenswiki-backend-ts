"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vote = void 0;
// TODO Add Reactions
var Vote;
(function (Vote) {
    Vote[Vote["UPVOTE"] = 1] = "UPVOTE";
    Vote[Vote["NO_VOTE"] = 0] = "NO_VOTE";
    Vote[Vote["DOWNVOTE"] = -1] = "DOWNVOTE";
})(Vote || (exports.Vote = Vote = {}));
