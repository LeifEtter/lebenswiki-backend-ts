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
exports.createReadForPack = exports.updateReadForPack = void 0;
const database_1 = __importDefault(require("../../../database/database"));
const helper_error_1 = require("../../error/helper.error");
const updateReadForPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const recordsUpdated = yield database_1.default.read.updateMany({
            where: {
                userId: res.locals.user.id,
                packId: res.locals.id,
            },
            data: {
                progress: req.body.progress,
            },
        });
        if (recordsUpdated.count == 0) {
            return res.status(404).send({ message: "Read couldn't be found" });
        }
        return res.status(200).send({
            message: `Reads progress successfully updated to ${req.body.progress}`,
        });
    }
    catch (error) {
        console.log(error);
        return res
            .status(501)
            .send({ message: "Something went wrong updating the Read" });
    }
});
exports.updateReadForPack = updateReadForPack;
const createReadForPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingRead = yield database_1.default.read.findFirst({
            where: {
                userId: res.locals.user.id,
                packId: res.locals.id,
            },
        });
        //TODO Bad code
        if (existingRead) {
            yield database_1.default.read.updateMany({
                where: {
                    userId: res.locals.user.id,
                    packId: res.locals.id,
                },
                data: { progress: 1 },
            });
            return res
                .status(201)
                .send({
                message: "You have already created a read for this pack, its ok",
            });
        }
        const readResult = yield database_1.default.read.create({
            data: {
                progress: 1,
                User: {
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
        return res
            .status(201)
            .send({ message: "Read Pack successfully", read: readResult });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "Pack" });
    }
});
exports.createReadForPack = createReadForPack;
