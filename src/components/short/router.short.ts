import { Router } from "express";
import {
  bookmarkShort,
  clapForShort,
  createShort,
  deleteShort,
  getAllShorts,
  getAllShortsWithCategories,
  getBookmarkedShorts,
  getOwnPublishedShorts,
  getOwnUnpublishedShorts,
  publishShort,
  reportShort,
  unbookmarkShort,
  unpublishShort,
} from "./controller.short";
import authenticate from "../../middleware/authentication.middleware";
import { body } from "express-validator";
import {
  checkValidId,
  checkValidatorResult,
} from "../../middleware/validation.middleware";
import minLevel from "../../middleware/authorization.middleware";

const router: Router = Router();

router.route("/").get(authenticate, getAllShorts);

router.route("/categorized").get(authenticate, getAllShortsWithCategories);

router.route("/create").post(
  authenticate,
  minLevel(2),
  body("title").exists().escape().isString().isLength({ min: 10, max: 100 }),
  body("content").exists().escape().isString().isLength({ min: 10, max: 500 }),
  body("categories").exists().isArray(),
  checkValidatorResult({
    resource: "Short",
    msg: "Please make sure you're passing 'title' and 'content' as strings.",
  }),
  createShort,
);

router.route("/bookmarked").get(authenticate, minLevel(2), getBookmarkedShorts);

router
  .route("/own/published")
  .get(authenticate, minLevel(2), getOwnPublishedShorts);
router
  .route("/own/unpublished")
  .get(authenticate, minLevel(2), getOwnUnpublishedShorts);

router
  .route("/clap/:id")
  .patch(checkValidId, authenticate, minLevel(2), clapForShort);

router
  .route("/publish/:id")
  .patch(checkValidId, authenticate, minLevel(2), publishShort);
router
  .route("/unpublish/:id")
  .patch(checkValidId, authenticate, minLevel(2), unpublishShort);

router
  .route("/delete/:id")
  .delete(checkValidId, authenticate, minLevel(2), deleteShort);

router
  .route("/bookmark/:id")
  .patch(checkValidId, authenticate, minLevel(2), bookmarkShort);

router
  .route("/unbookmark/:id")
  .patch(checkValidId, authenticate, minLevel(2), unbookmarkShort);

router.route("/report/:id").patch(
  checkValidId,
  authenticate,
  minLevel(2),
  body("reason").exists().isString().escape(),
  checkValidatorResult({
    resource: "Report",
    msg: "Please make sure you're passing a 'reason' as a string.",
  }),
  reportShort,
);

export default router;
