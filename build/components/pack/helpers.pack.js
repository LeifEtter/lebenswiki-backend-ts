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
exports.getPacksForReturn = exports.convertPackForResponse = void 0;
const database_1 = __importDefault(require("../../database/database"));
const helpers_user_1 = require("../user/helpers.user");
const helpers_category_1 = require("../category/helpers.category");
const helper_comment_1 = require("../comment/helper.comment");
const controller_image_1 = require("../image/controller.image");
const checkIfUserHasBookmarked = (userId, bookmarks) => {
    const bookmarkMadeByUser = bookmarks.filter((user) => user.id == userId);
    if (bookmarkMadeByUser.length > 0) {
        return true;
    }
    else {
        return false;
    }
};
const checkIfUserHasClapped = (userId, claps) => {
    const clappedByUser = claps.filter((user) => user.id == userId);
    if (clappedByUser.length > 0) {
        return true;
    }
    else {
        return false;
    }
};
const convertPackForResponse = ({ userId, pack, includeComments, includePages, }) => __awaiter(void 0, void 0, void 0, function* () {
    const userHasBookmarked = checkIfUserHasBookmarked(userId, pack.User_bookmarkedByForPack);
    const userHasClapped = checkIfUserHasClapped(userId, pack.User_userClap);
    const totalClaps = pack.User_userClap.length;
    const totalBookmarks = pack.User_bookmarkedByForPack.length;
    const readProgress = pack.Read.length > 0 ? pack.Read[0].progress : 0;
    const creator = yield (0, helpers_user_1.convertUserForResponse)(pack.User_Pack_creatorIdToUser);
    const categories = pack.Category.map((cat) => (0, helpers_category_1.convertCategoryForResponse)(cat));
    let comments = [];
    if (includeComments) {
        comments = yield Promise.all(pack.Comment.map((comment) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, helper_comment_1.convertCommentForResponse)({ comment, userId }); })));
    }
    const titleImage = yield (0, controller_image_1.getSignedUrlForCover)(pack.id);
    for (const page of pack.pages) {
        for (const item of page.items) {
            if (item.type == "ItemType.image") {
                item.headContent.value = yield (0, controller_image_1.getSignedUrlForImageViewing)(`packs/${pack.id}/pages/${item.id}.png`);
            }
        }
    }
    return {
        id: pack.id,
        title: pack.title,
        description: pack.description,
        creationDate: pack.creationDate,
        readTime: pack.readTime,
        creator,
        initiative: pack.initiative,
        readProgress,
        totalBookmarks,
        userHasBookmarked,
        userHasClapped,
        categories,
        totalClaps,
        titleImage,
        comments: comments.length != 0 ? comments : undefined,
        pages: pack.pages,
        published: pack.published,
    };
});
exports.convertPackForResponse = convertPackForResponse;
const getPacksForReturn = ({ where, userId, blockList, includeComments, includePages, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const packs = yield database_1.default.pack.findMany({
            where: Object.assign({ User_Pack_creatorIdToUser: {
                    id: {
                        notIn: blockList,
                    },
                } }, where),
            include: {
                User_Pack_creatorIdToUser: true,
                User_bookmarkedByForPack: true,
                User_userClap: true,
                Category: { select: { id: true, categoryName: true } },
                Read: {
                    where: { userId: userId },
                    select: { progress: true },
                },
                Comment: {
                    where: {
                        id: {
                            notIn: blockList,
                        },
                    },
                    include: {
                        User_commentDownVote: true,
                        User_commentUpVote: true,
                        User_Comment_creatorIdToUser: true,
                    },
                },
                pages: {
                    select: {
                        id: true,
                        pageNumber: true,
                        items: {
                            select: {
                                position: true,
                                id: true,
                                type: true,
                                headContent: {
                                    select: {
                                        id: true,
                                        value: true,
                                    },
                                },
                                bodyContent: {
                                    select: {
                                        id: true,
                                        value: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const packsForResponse = yield Promise.all(packs.map((pack) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, exports.convertPackForResponse)({
                userId,
                pack,
                includeComments,
                includePages,
            });
        })));
        return packsForResponse;
    }
    catch (error) {
        console.log("Error while trying to retrieve packs for return");
        throw error;
    }
});
exports.getPacksForReturn = getPacksForReturn;
