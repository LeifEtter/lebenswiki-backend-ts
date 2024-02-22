import { Router } from "express";
import {
  clapForShort,
  createShort,
  deleteShort,
  getAllShorts,
  getAllShortsWithCategories,
  getOwnPublishedShorts,
  getOwnUnpublishedShorts,
  publishShort,
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
  body(["title", "content"]).exists().isString().escape(),
  checkValidatorResult({
    msg: "Please make sure you're passing 'title' and 'content' as strings.",
  }),
  createShort,
);

router
  .route("/own/published")
  .get(authenticate, minLevel(2), getOwnPublishedShorts);
router
  .route("/own/unpublished")
  .get(authenticate, minLevel(2), getOwnUnpublishedShorts);

router.route("/clap/:id").patch(authenticate, minLevel(2), clapForShort);

router
  .route("/publish/:id")
  .patch(checkValidId, authenticate, minLevel(2), publishShort);
router
  .route("/unpublish/:id")
  .patch(checkValidId, authenticate, minLevel(2), unpublishShort);

router
  .route("/delete/:id")
  .delete(checkValidId, authenticate, minLevel(2), deleteShort);

export default router;
