import { Router } from "express";

import authenticate from "../../middleware/authentication.middleware";
import minLevel from "../../middleware/authorization.middleware";
import { body, check } from "express-validator";
import {
  clapForPack,
  createPack,
  deleteOwnPack,
  getAllPacks,
  getAllPacksWithCategories,
  getOwnPublished,
  getOwnUnpublished,
  getReadPacks,
  getUnreadPacks,
  publishPack,
  unpublishPack,
  updatePack,
  viewPack,
} from "./controller.pack";
import {
  checkValidId,
  checkValidatorResult,
} from "../../middleware/validation.middleware";
import ReportRouter from "./report/router.report.pack";
import ReadRouter from "./read/router.read.pack";
import BookmarkRouter from "./bookmark/router.bookmark.pack";
import multer = require("multer");
const upload = multer();

const router: Router = Router();

router.use("/report", ReportRouter);
router.use("/read", ReadRouter);
router.use("/bookmark", BookmarkRouter);

router.route("/create").post(
  authenticate,
  minLevel(3),
  body(["title", "description"]).exists().isString().escape(),
  body(["initiative"]).exists().isString().escape(),
  body(["categories"]).exists().isArray(),
  body(["categories.*", "readTime"]).isNumeric(),
  // NOT SAFE IF SOMEBODY CAN ACCESS CREATOR ACCOUNT
  body(["pages"]).exists(),
  checkValidatorResult({
    msg: "Please make sure you are passing a title, description, initiative, categories as a list of numbers id's (numbers) and pages in the form of JSON.",
  }),
  upload.single("coverImage"),
  createPack,
);

router.route("/update/:id").put(
  checkValidId,
  authenticate,
  minLevel(3),
  body(["title", "description"]).exists().isString().escape(),
  body(["initiative"]).exists().isString().escape(),
  body(["categories"]).exists().isArray(),
  body(["categories.*", "readTime"]).isNumeric(),
  body(["pages"]).exists().isJSON().escape(),
  checkValidatorResult({
    msg: "Please make sure you are passing a title, description, initiative, categories as a list of numbers id's (numbers) and pages in the form of JSON.",
  }),
  updatePack,
);

router.route("/view/:id").get(checkValidId, authenticate, viewPack);

router
  .route("/own/unpublished")
  .get(authenticate, minLevel(3), getOwnUnpublished);

router.route("/own/published").get(authenticate, minLevel(3), getOwnPublished);

router
  .route("/own/publish/:id")
  .get(checkValidId, authenticate, minLevel(3), publishPack);

router
  .route("/own/unpublish/:id")
  .get(checkValidId, authenticate, minLevel(3), unpublishPack);

router.route("/unreads").get(authenticate, getUnreadPacks);
router.route("/reads").get(authenticate, getReadPacks);

router
  .route("/own/delete/:id")
  .delete(checkValidId, authenticate, minLevel(3), deleteOwnPack);

router.route("/").get(authenticate, getAllPacks);

router
  .route("/clap/:id")
  .patch(checkValidId, authenticate, minLevel(2), clapForPack);

router.route("/categorized").get(authenticate, getAllPacksWithCategories);

export default router;
