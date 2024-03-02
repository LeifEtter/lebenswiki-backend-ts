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
exports.updatePages = exports.uploadItemImage = void 0;
const controller_image_1 = require("../../image/controller.image");
const database_1 = __importDefault(require("../../../database/database"));
const helper_error_1 = require("../../error/helper.error");
const uploadItemImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (req.params == null || req.params.packId == null || !req.params.itemId) {
            return res.status(404).send({ message: "Pass proper id" });
        }
        const { packId, itemId } = req.params;
        if (((_a = (yield database_1.default.pack.findFirst({ where: { id: packId } }))) === null || _a === void 0 ? void 0 : _a.creatorId) !=
            res.locals.user.id) {
            return res.status(401).send({ message: "This isn't your pack" });
        }
        const imagePath = `packs/${packId}/pages/${itemId}.png`;
        yield (0, controller_image_1.uploadImageToS3)(imagePath, req.file.buffer);
        const url = yield (0, controller_image_1.getSignedUrlForImageViewing)(imagePath);
        return res.status(201).send(url);
    }
    catch (error) {
        console.log(error);
        return res.status(501).send({ message: "Pack Image Couldn't be updated" });
    }
});
exports.uploadItemImage = uploadItemImage;
const updatePages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pack = yield database_1.default.pack.findFirst({
            where: { id: parseInt(req.params.packId) },
        });
        if ((pack === null || pack === void 0 ? void 0 : pack.creatorId) != res.locals.user.id) {
            return res.status(401).send({ message: "This isn't your pack" });
        }
        const pages = req.body;
        // Delete all pages so don't have to update
        yield database_1.default.packPage.deleteMany({
            where: {
                packId: parseInt(req.params.packId),
            },
        });
        for (const page of pages) {
            const createdPage = yield database_1.default.packPage.create({
                data: {
                    id: page.id,
                    pageNumber: page.pageNumber,
                    pack: {
                        connect: {
                            id: parseInt(req.params.packId),
                        },
                    },
                },
            });
            const items = page.items;
            for (const item of items) {
                if (item.headContent == null) {
                    throw "Please provide head content for every pack page item";
                }
                const createdHeadContent = yield database_1.default.packPageItemHeadContent.create({
                    data: {
                        id: item.headContent.id,
                        value: item.headContent.value,
                    },
                });
                const createdItem = yield database_1.default.packPageItem.create({
                    data: {
                        id: item.id,
                        type: item.type,
                        PackPage: {
                            connect: {
                                id: createdPage.id,
                            },
                        },
                        headContent: {
                            connect: {
                                id: createdHeadContent.id,
                            },
                        },
                        position: item.position,
                    },
                });
                if (item.bodyContent) {
                    for (const bodyItem of item.bodyContent) {
                        yield database_1.default.packPageItemBodyContent.create({
                            data: {
                                id: bodyItem.id,
                                value: bodyItem.value,
                                parent: {
                                    connect: {
                                        id: createdItem.id,
                                    },
                                },
                            },
                        });
                    }
                }
            }
        }
        return res.status(200).send({ message: "Saved" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "Pack" });
    }
});
exports.updatePages = updatePages;
