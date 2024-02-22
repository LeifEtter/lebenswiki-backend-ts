"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_feedback_1 = require("./controller.feedback");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router
    .route("/create")
    .post((0, express_validator_1.body)(["type", "content"]).exists().isString().escape(), authentication_middleware_1.default, controller_feedback_1.createFeedBack);
exports.default = router;
