import { Router } from "express";
import authenticate from "../../middleware/authentication.middleware";
import minLevel from "../../middleware/authorization.middleware";
import { body } from "express-validator";
import {
  clapForPack,
  createPack,
  deleteOwnPack,
  getAllPacks,
  getAllPacksWithCategories,
  getOwnPublished,
  getOwnUnpublished,
  getQuizById,
  getReadPacks,
  getUnreadPacks,
  publishPack,
  unpublishPack,
  updatePack,
  uploadPackImage,
  viewPack,
} from "./controller.pack";
import {
  checkValidId,
  checkValidStringId,
  checkValidatorResult,
} from "../../middleware/validation.middleware";
import ReportRouter from "./report/router.report.pack";
import ReadRouter from "./read/router.read.pack";
import BookmarkRouter from "./bookmark/router.bookmark.pack";
import PagesRouter from "./pages/router.pages.pack";
import multer = require("multer");
const upload = multer();

const router: Router = Router();

router.use("/report", ReportRouter);
router.use("/read", ReadRouter);
router.use("/bookmark", BookmarkRouter);
router.use("/:packId/pages", PagesRouter);

router.route("/create").post(
  authenticate,
  minLevel(3),
  body("title").exists().escape().isString().isLength({ min: 10, max: 100 }),
  body("description")
    .exists()
    .escape()
    .isString()
    .isLength({ min: 10, max: 500 }),
  body("initiative").escape().isString(),
  body("categories").exists().isArray(),
  body("readTime").exists().isFloat({ min: 1 }),
  body("pages").exists(),
  checkValidatorResult({
    resource: "Pack",
    msg: "Please make sure you are passing a title, description, initiative, categories as a list of numbers id's (numbers) and pages in the form of JSON.",
  }),
  createPack
);

router.route("/update/:id").put(
  checkValidId,
  authenticate,
  minLevel(3),
  body("title").escape().isString().isLength({ min: 10, max: 100 }),
  body("description").escape().isString().isLength({ min: 10, max: 500 }),
  body("initiative").escape().isString(),
  body("categories").isArray(),
  body("readTime").isFloat({ min: 1 }),
  body("pages").isArray(),
  checkValidatorResult({
    resource: "Pack",
    msg: "Please make sure you are passing a title, description, initiative, categories as a list of numbers id's (numbers) and pages in the form of JSON.",
  }),
  updatePack
);

router.route("/view/:id").get(checkValidId, authenticate, viewPack);

router
  .route("/own/unpublished")
  .get(authenticate, minLevel(3), getOwnUnpublished);

router.route("/own/published").get(authenticate, minLevel(3), getOwnPublished);

router
  .route("/own/publish/:id")
  .patch(checkValidId, authenticate, minLevel(3), publishPack);

router
  .route("/own/unpublish/:id")
  .patch(checkValidId, authenticate, minLevel(3), unpublishPack);

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

router
  .route("/cover/upload/:id")
  .post(checkValidId, upload.single("image"), uploadPackImage);

router.route("/quiz/:id").get(checkValidStringId, getQuizById);

export default router;
