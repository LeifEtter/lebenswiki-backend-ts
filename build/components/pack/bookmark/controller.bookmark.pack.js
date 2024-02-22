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
exports.getBookmarkedPacks = exports.removeBookmarkFromPack = exports.bookmarkPack = void 0;
const database_1 = __importDefault(require("../../../database/database"));
const helper_error_1 = require("../../error/helper.error");
const helpers_pack_1 = require("../helpers.pack");
const helpers_block_1 = require("../../block/helpers.block");
const bookmarkPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.pack.update({
            where: {
                id: res.locals.id,
            },
            data: {
                User_bookmarkedByForPack: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res.status(200).send({ message: "Successfully bookmarked pack" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.bookmarkPack = bookmarkPack;
const removeBookmarkFromPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.pack.update({
            where: {
                id: res.locals.id,
            },
            data: {
                User_bookmarkedByForPack: {
                    disconnect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res
            .status(200)
            .send({ message: "Successfully removed Bookmark from the Pack" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.removeBookmarkFromPack = removeBookmarkFromPack;
const getBookmarkedPacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                User_bookmarkedByForPack: {
                    some: {
                        id: res.locals.user.id,
                    },
                },
            },
            userId: res.locals.user.id,
            blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
        });
        return res.status(200).send(packs);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "Bookmakred Packs", rId: 0 });
    }
});
exports.getBookmarkedPacks = getBookmarkedPacks;
