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
exports.clapForPack = exports.getAllPacksWithCategories = exports.getAllPacks = exports.deleteOwnPack = exports.unpublishPack = exports.publishPack = exports.getUnreadPacks = exports.getReadPacks = exports.getOwnPublished = exports.getOwnUnpublished = exports.viewPack = exports.createPack = exports.updatePack = void 0;
const database_1 = __importDefault(require("../../database/database"));
const express_1 = require("express");
const helper_error_1 = require("../error/helper.error");
const helpers_block_1 = require("../block/helpers.block");
const helpers_pack_1 = require("./helpers.pack");
const router = (0, express_1.Router)();
const updatePack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, initiative, readTime, pages } = req.body;
        const prevPack = yield database_1.default.pack.findUnique({
            where: { id: res.locals.id },
            include: { Category: true },
        });
        const catsToDisconnect = prevPack === null || prevPack === void 0 ? void 0 : prevPack.Category.map((cat) => cat.id).filter((item) => req.body.categories.indexOf(item) < 0);
        const pack = yield database_1.default.pack.update({
            where: {
                id: res.locals.id,
                User_Pack_creatorIdToUser: {
                    id: res.locals.user.id,
                },
            },
            data: {
                title: title,
                description: description,
                initiative: initiative,
                readTime: readTime,
                reactions: [],
                pages: pages,
                User_Pack_creatorIdToUser: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
                Category: {
                    disconnect: catsToDisconnect === null || catsToDisconnect === void 0 ? void 0 : catsToDisconnect.map((id) => ({ id: id })),
                    connect: req.body.categories.map((catId) => ({
                        id: catId,
                    })),
                },
            },
            include: {
                Category: true,
            },
        });
        return res.status(200).send({ message: "Pack updated successfully", pack });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.updatePack = updatePack;
const createPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, initiative, readTime, pages } = req.body;
        const packResult = yield database_1.default.pack.create({
            data: {
                title: title,
                description: description,
                initiative: initiative,
                readTime: readTime,
                reactions: [],
                User_Pack_creatorIdToUser: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
                Category: {
                    connect: req.body.categories.map((catId) => ({
                        id: catId,
                    })),
                },
            },
        });
        yield (0, helpers_pack_1.savePages)({
            packId: packResult.id,
            pagesJson: pages,
            isUpdate: false,
        });
        return res
            .status(201)
            .send({ message: "Pack Creation successful", pack: packResult });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.createPack = createPack;
const viewPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const blockList = yield (0, helpers_block_1.getBlocksAsIdList)((_a = res.locals.user.id) !== null && _a !== void 0 ? _a : []);
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                id: res.locals.id,
            },
            userId: res.locals.user.id,
            blockList,
            includeComments: true,
            includePages: true,
        });
        return res.status(200).send(packs[0]);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.viewPack = viewPack;
const getOwnUnpublished = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockList = yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id);
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                creatorId: res.locals.user.id,
                published: false,
            },
            userId: res.locals.user.id,
            blockList,
        });
        return res.status(200).send(packs);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.getOwnUnpublished = getOwnUnpublished;
const getOwnPublished = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockList = yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id);
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                creatorId: res.locals.user.id,
                published: true,
            },
            userId: res.locals.user.id,
            blockList,
        });
        return res.status(200).send(packs);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.getOwnPublished = getOwnPublished;
const getReadPacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockList = yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id);
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                published: true,
                Read: {
                    some: {
                        userId: res.locals.user.id,
                    },
                },
            },
            userId: res.locals.user.id,
            blockList,
        });
        return res.status(200).send(packs);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.getReadPacks = getReadPacks;
const getUnreadPacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockList = yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id);
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                published: true,
                Read: {
                    none: {
                        userId: res.locals.user.id,
                    },
                },
            },
            userId: res.locals.user.id,
            blockList,
        });
        return res.status(200).send(packs);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.getUnreadPacks = getUnreadPacks;
const publishPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.pack.update({
            where: { id: res.locals.id, creatorId: res.locals.user.id },
            data: {
                published: true,
            },
        });
        return res.status(200).send({ message: "Pack Published successfully" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.publishPack = publishPack;
const unpublishPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.pack.update({
            where: { id: res.locals.id, creatorId: res.locals.user.id },
            data: {
                published: false,
            },
        });
        return res.status(200).send({ message: "Pack Unpublished successfully" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.unpublishPack = unpublishPack;
const deleteOwnPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.pack.delete({
            where: { id: res.locals.id, creatorId: res.locals.user.id },
        });
        return res.status(200).send({ message: "Pack Deleted successfully" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.deleteOwnPack = deleteOwnPack;
const getAllPacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blockList = yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id);
        const packs = yield (0, helpers_pack_1.getPacksForReturn)({
            where: {
                published: true,
            },
            userId: res.locals.user.id,
            blockList,
        });
        return res.status(200).send(packs);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.getAllPacks = getAllPacks;
const getAllPacksWithCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield database_1.default.category.findMany();
        const categorizedPacks = yield Promise.all(categories.map((cat) => __awaiter(void 0, void 0, void 0, function* () {
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
            });
        })));
        const allPacks = yield (0, helpers_pack_1.getPacksForReturn)({
            where: { published: true },
            userId: res.locals.user.id,
            blockList: yield (0, helpers_block_1.getBlocksAsIdList)(res.locals.user.id),
        });
        const allPacksCategory = {
            id: 0,
            name: "Alle",
            packs: allPacks,
        };
        categorizedPacks.unshift(allPacksCategory);
        return res.status(200).send(categorizedPacks);
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: 0 });
    }
});
exports.getAllPacksWithCategories = getAllPacksWithCategories;
const clapForPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.pack.update({
            where: { id: res.locals.id },
            data: {
                User_userClap: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res.status(200).send({ message: "Clapped for pack" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack", rId: res.locals.id });
    }
});
exports.clapForPack = clapForPack;
