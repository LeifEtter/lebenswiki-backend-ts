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
exports.getAllPacksAndShortsWithCategories = exports.getShortsForCategory = exports.getPacksForCategory = exports.getAllCategories = void 0;
const database_1 = __importDefault(require("../../database/database"));
const express_1 = require("express");
const helper_error_1 = require("../error/helper.error");
const helpers_pack_1 = require("../pack/helpers.pack");
const helpers_block_1 = require("../block/helpers.block");
const helper_short_1 = require("../short/helper.short");
const helpers_category_1 = require("./helpers.category");
const router = (0, express_1.Router)();
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield database_1.default.category.findMany({
            select: {
                id: true,
                categoryName: true,
            },
            orderBy: {
                id: "asc",
            },
        });
        const categoriesForReturn = categories.map((cat) => (0, helpers_category_1.convertCategoryForResponse)(cat));
        return res.status(200).send(categoriesForReturn);
    }
    catch (err) {
        console.log(err);
        return res.status(501).send({ message: "Couldn't get Categories" });
    }
});
exports.getAllCategories = getAllCategories;
const getPacksForCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                published: true,
                Category: {
                    some: {
                        id: res.locals.id,
                    },
                },
            },
            userId: res.locals.user.id,
            blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
        });
        return res.status(200).send(packs);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "Packs", rId: res.locals.id });
    }
});
exports.getPacksForCategory = getPacksForCategory;
const getShortsForCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shorts = yield database_1.default.short.findMany({
            where: {
                Category: {
                    some: {
                        id: res.locals.id,
                    },
                },
            },
            include: {
                User_Short_creatorIdToUser: true,
                User_bookmarkedBy: true,
                User_downVote: true,
                User_upVote: true,
                User_clap: true,
            },
        });
        const shortsToReturn = yield Promise.all(shorts.map((short) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, helper_short_1.convertShortForResponse)(res.locals.user.id, short); })));
        return res.status(200).send(shortsToReturn);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ rName: "Short", rId: 0, res, error });
    }
});
exports.getShortsForCategory = getShortsForCategory;
const getAllPacksAndShortsWithCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield database_1.default.category.findMany();
        const categorizedPacksAndShorts = yield Promise.all(categories.map((cat) => __awaiter(void 0, void 0, void 0, function* () {
            return ({
                id: cat.id,
                name: cat.categoryName,
                packs: yield (0, helpers_pack_1.getPacksForReturn)({
                    where: {
                        published: true,
                        Category: {
                            some: {
                                id: cat.id,
                            },
                        },
                    },
                    userId: res.locals.user.id,
                    blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
                }),
                shorts: yield (0, helper_short_1.getShortsForResponse)({
                    where: {
                        published: true,
                        Category: {
                            some: {
                                id: cat.id,
                            },
                        },
                    },
                    userId: res.locals.user.id,
                    blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
                }),
            });
        })));
        const allPacks = yield (0, helpers_pack_1.getPacksForReturn)({
            where: { published: true },
            userId: res.locals.user.id,
            blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
        });
        const allShorts = yield (0, helper_short_1.getShortsForResponse)({
            where: { published: true },
            userId: res.locals.user.id,
            blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
        });
        const allPacksAndShortsCategory = {
            id: 0,
            name: "Alle",
            packs: allPacks,
            shorts: allShorts,
        };
        categorizedPacksAndShorts.unshift(allPacksAndShortsCategory);
        return res.status(200).send(categorizedPacksAndShorts);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: 0 });
    }
});
exports.getAllPacksAndShortsWithCategories = getAllPacksAndShortsWithCategories;
