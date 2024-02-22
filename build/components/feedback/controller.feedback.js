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
exports.createFeedBack = void 0;
const database_1 = __importDefault(require("../../database/database"));
const helper_error_1 = require("../error/helper.error");
const createFeedBack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, content } = req.body;
        yield database_1.default.feedback.create({
            data: {
                type: type,
                content: content,
                user: {
                    connect: {
                        id: res.locals.user.id,
                    },
                },
            },
        });
        return res.status(201).send({ message: "Feedback created" });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ error, res, rName: "Feedback", rId: 0 });
    }
});
exports.createFeedBack = createFeedBack;
