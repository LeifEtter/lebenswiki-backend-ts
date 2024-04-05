"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const authentication_middleware_1 = __importDefault(require("../../../middleware/authentication.middleware"));
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const express_1 = require("express");
const controller_read_pack_1 = require("./controller.read.pack");
const router = (0, express_1.Router)();
router.route("/update/:id").patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, express_validator_1.body)("progress").exists().isNumeric(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Read",
    msg: "Please make sure to pass 'progress' with an integer",
}), controller_read_pack_1.updateReadForPack);
router.route("/create/:id").post(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, validation_middleware_1.checkValidatorResult)({
    resource: "Read",
    msg: "Please make sure to pass 'progress' with an integer",
}), controller_read_pack_1.createReadForPack);
exports.default = router;
