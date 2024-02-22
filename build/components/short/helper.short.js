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
exports.convertShortForResponse = exports.getShortsForResponse = void 0;
const helpers_user_1 = require("../user/helpers.user");
const database_1 = __importDefault(require("../../database/database"));
const getShortsForResponse = ({ where, userId, }) => __awaiter(void 0, void 0, void 0, function* () {
    const shorts = yield database_1.default.short.findMany({
        where,
        include: {
            User_Short_creatorIdToUser: true,
            User_bookmarkedBy: true,
            User_downVote: true,
            User_upVote: true,
            User_clap: true,
        },
    });
    const shortsForResponse = yield Promise.all(shorts.map((short) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, exports.convertShortForResponse)(userId, short); })));
    return shortsForResponse;
});
exports.getShortsForResponse = getShortsForResponse;
const convertShortForResponse = (userId, short) => __awaiter(void 0, void 0, void 0, function* () {
    const bookmarkCount = short.User_bookmarkedBy.length;
    const votes = short.User_upVote.length - short.User_downVote.length;
    const creator = yield (0, helpers_user_1.convertUserForResponse)(short.User_Short_creatorIdToUser);
    const totalClaps = short.User_clap.length;
    const userHasClapped = short.User_clap.filter((user) => user.id == userId).length > 0;
    const userHasBookmarked = short.User_bookmarkedBy.filter((user) => user.id == userId).length > 0;
    return {
        id: short.id,
        title: short.title,
        content: short.content,
        bookmarks: bookmarkCount,
        userHasBookmarked,
        totalClaps,
        userHasClapped,
        votes,
        creator,
        creationDate: short.creationDate,
        claps: 0,
        published: short.published,
    };
});
exports.convertShortForResponse = convertShortForResponse;
