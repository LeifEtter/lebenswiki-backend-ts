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
exports.unpublishShort = exports.publishShort = exports.clapForShort = exports.getAllShortsWithCategories = exports.getOwnUnpublishedShorts = exports.getOwnPublishedShorts = exports.deleteShort = exports.createShort = exports.getAllShorts = void 0;
const helper_error_1 = require("../error/helper.error");
const database_1 = __importDefault(require("../../database/database"));
const helper_short_1 = require("./helper.short");
const helpers_block_1 = require("../block/helpers.block");
const getAllShorts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shorts = yield database_1.default.short.findMany({
            where: {
                published: true,
                User_Short_creatorIdToUser: {
                    id: {
                        notIn: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
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
exports.getAllShorts = getAllShorts;
const createShort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const canPublishImmediately = res.locals.user.role.level >= 3;
        const { title, content, categories } = req.body;
        console.log(categories);
        const short = yield database_1.default.short.create({
            data: {
                title,
                content,
                published: canPublishImmediately,
                User_Short_creatorIdToUser: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
                Category: {
                    connect: categories.map((cat) => ({
                        id: cat.id,
                    })),
                },
            },
        });
        return res.status(200).send({
            message: `Short was created and ${canPublishImmediately ? "requested to be" : ""} published`,
        });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ rName: "Short", rId: 0, error, res });
    }
});
exports.createShort = createShort;
const deleteShort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.short.delete({
            where: {
                id: res.locals.id,
                creatorId: res.locals.user.id,
            },
        });
        return res.status(200).send({ message: "Short deleted successfully" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "Short", rId: res.locals.id });
    }
});
exports.deleteShort = deleteShort;
const getOwnPublishedShorts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shorts = yield database_1.default.short.findMany({
            where: { published: true, creatorId: res.locals.user.id },
            include: {
                User_Short_creatorIdToUser: true,
                User_bookmarkedBy: true,
                User_downVote: true,
                User_upVote: true,
                User_clap: true,
            },
        });
        const shortsForResponse = yield Promise.all(shorts.map((short) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, helper_short_1.convertShortForResponse)(res.locals.user.id, short); })));
        return res.status(200).send(shortsForResponse);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Published Shorts", rId: 0 });
    }
});
exports.getOwnPublishedShorts = getOwnPublishedShorts;
const getOwnUnpublishedShorts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const shorts = yield database_1.default.short.findMany({
            where: { published: false, creatorId: res.locals.user.id },
            include: {
                User_Short_creatorIdToUser: true,
                User_bookmarkedBy: true,
                User_downVote: true,
                User_upVote: true,
                User_clap: true,
            },
        });
        const shortsForResponse = yield Promise.all(shorts.map((short) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, helper_short_1.convertShortForResponse)(res.locals.user.id, short); })));
        return res.status(200).send(shortsForResponse);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Published Shorts", rId: 0 });
    }
});
exports.getOwnUnpublishedShorts = getOwnUnpublishedShorts;
const getAllShortsWithCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield database_1.default.category.findMany();
        const categorizedShorts = yield Promise.all(categories.map((cat) => __awaiter(void 0, void 0, void 0, function* () {
            return ({
                id: cat.id,
                name: cat.categoryName,
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
        const allShorts = yield (0, helper_short_1.getShortsForResponse)({
            where: { published: true },
            userId: res.locals.user.id,
            blockList: [],
        });
        const allShortsCategory = {
            id: 0,
            name: "Alle",
            shorts: allShorts,
        };
        categorizedShorts.unshift(allShortsCategory);
        return res.status(200).send(categorizedShorts);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Short", rId: 0 });
    }
});
exports.getAllShortsWithCategories = getAllShortsWithCategories;
const clapForShort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.short.update({
            where: { id: res.locals.id },
            data: {
                User_clap: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res.status(200).send({ message: "Clapped for Short" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Short", rId: res.locals.id });
    }
});
exports.clapForShort = clapForShort;
const publishShort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.short.update({
            where: { id: res.locals.id },
            data: {
                published: true,
            },
        });
        return res.status(200).send({ message: "Short published" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Short", rId: 0 });
    }
});
exports.publishShort = publishShort;
const unpublishShort = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.short.update({
            where: { id: res.locals.id },
            data: {
                published: false,
            },
        });
        return res.status(200).send({ message: "Short unpublished" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Short", rId: 0 });
    }
});
exports.unpublishShort = unpublishShort;
