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
exports.getPackReports = exports.reportPack = void 0;
const database_1 = __importDefault(require("../../../database/database"));
const helper_error_1 = require("../../error/helper.error");
const reportPack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield database_1.default.report.create({
            data: {
                reason: req.body.reason,
                Pack: {
                    connect: {
                        id: res.locals.id,
                    },
                },
            },
        });
        return res.status(201).send({
            message: "Report successfully handed in",
            reportId: report.id,
        });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack" });
    }
});
exports.reportPack = reportPack;
const getPackReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reports = yield database_1.default.report.findMany({
            where: {
                Pack: { isNot: null },
            },
            include: {
                Pack: true,
            },
        });
        return res.status(200).send({ reports });
    }
    catch (error) {
        return (0, helper_error_1.handleError)({ res, error, rName: "Pack" });
    }
});
exports.getPackReports = getPackReports;
