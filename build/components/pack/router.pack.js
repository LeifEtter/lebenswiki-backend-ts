"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authentication_middleware_1 = __importDefault(require("../../middleware/authentication.middleware"));
const authorization_middleware_1 = __importDefault(require("../../middleware/authorization.middleware"));
const express_validator_1 = require("express-validator");
const controller_pack_1 = require("./controller.pack");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const router_report_pack_1 = __importDefault(require("./report/router.report.pack"));
const router_read_pack_1 = __importDefault(require("./read/router.read.pack"));
const router_bookmark_pack_1 = __importDefault(require("./bookmark/router.bookmark.pack"));
const router_pages_pack_1 = __importDefault(require("./pages/router.pages.pack"));
const multer = require("multer");
const upload = multer();
const router = (0, express_1.Router)();
router.use("/report", router_report_pack_1.default);
router.use("/read", router_read_pack_1.default);
router.use("/bookmark", router_bookmark_pack_1.default);
router.use("/:packId/pages", router_pages_pack_1.default);
router.route("/create").post(authentication_middleware_1.default, (0, authorization_middleware_1.default)(3), (0, express_validator_1.body)("title").exists().escape().isString().isLength({ min: 10, max: 100 }), (0, express_validator_1.body)("description")
    .exists()
    .escape()
    .isString()
    .isLength({ min: 10, max: 500 }), (0, express_validator_1.body)("initiative").escape().isString(), (0, express_validator_1.body)("categories").exists().isArray(), (0, express_validator_1.body)("readTime").exists().isFloat({ min: 1 }), (0, express_validator_1.body)("pages").exists(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Pack",
    msg: "Please make sure you are passing a title, description, initiative, categories as a list of numbers id's (numbers) and pages in the form of JSON.",
}), controller_pack_1.createPack);
router.route("/update/:id").put(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(3), (0, express_validator_1.body)("title").escape().isString().isLength({ min: 10, max: 100 }), (0, express_validator_1.body)("description").escape().isString().isLength({ min: 10, max: 500 }), (0, express_validator_1.body)("initiative").escape().isString(), (0, express_validator_1.body)("categories").isArray(), (0, express_validator_1.body)("readTime").isFloat({ min: 1 }), (0, express_validator_1.body)("pages").isArray(), (0, validation_middleware_1.checkValidatorResult)({
    resource: "Pack",
    msg: "Please make sure you are passing a title, description, initiative, categories as a list of numbers id's (numbers) and pages in the form of JSON.",
}), controller_pack_1.updatePack);
router.route("/view/:id").get(validation_middleware_1.checkValidId, authentication_middleware_1.default, controller_pack_1.viewPack);
router
    .route("/own/unpublished")
    .get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(3), controller_pack_1.getOwnUnpublished);
router.route("/own/published").get(authentication_middleware_1.default, (0, authorization_middleware_1.default)(3), controller_pack_1.getOwnPublished);
router
    .route("/own/publish/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(3), controller_pack_1.publishPack);
router
    .route("/own/unpublish/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(3), controller_pack_1.unpublishPack);
router.route("/unreads").get(authentication_middleware_1.default, controller_pack_1.getUnreadPacks);
router.route("/reads").get(authentication_middleware_1.default, controller_pack_1.getReadPacks);
router
    .route("/own/delete/:id")
    .delete(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(3), controller_pack_1.deleteOwnPack);
router.route("/").get(controller_pack_1.getAllPacks);
router
    .route("/clap/:id")
    .patch(validation_middleware_1.checkValidId, authentication_middleware_1.default, (0, authorization_middleware_1.default)(2), controller_pack_1.clapForPack);
router.route("/categorized").get(authentication_middleware_1.default, controller_pack_1.getAllPacksWithCategories);
router
    .route("/cover/upload/:id")
    .post(validation_middleware_1.checkValidId, upload.single("image"), controller_pack_1.uploadPackImage);
exports.default = router;
