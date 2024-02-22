"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const authentication_middleware_1 = __importDefault(require("../../../middleware/authentication.middleware"));
const express_validator_1 = require("express-validator");
const controller_report_pack_1 = require("./controller.report.pack");
const authorization_middleware_1 = __importDefault(require("../../../middleware/authorization.middleware"));
const router = (0, express_1.Router)();
router.route("/create/:id").post(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, express_validator_1.body)("reason").exists().isString(), (0, validation_middleware_1.checkValidatorResult)({
    msg: "Please make sure you are passing a 'reason' as a string.",
}), controller_report_pack_1.reportPack);
router.route("/").get(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(10), controller_report_pack_1.getPackReports);
exports.default = router;
