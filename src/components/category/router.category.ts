import { Router } from "express";
import {
  getAllCategories,
  getAllPacksAndShortsWithCategories,
  getPacksForCategory,
  getShortsForCategory,
} from "./controller.category";
import { checkValidId } from "../../middleware/validation.middleware";

import authenticate from "../../middleware/authentication.middleware";

const router: Router = Router();

router
  .route("/packsAndShorts")
  .get(authenticate, getAllPacksAndShortsWithCategories);

router.route("/").get(getAllCategories);

router.route("/:id/packs").get(checkValidId, authenticate, getPacksForCategory);

router
  .route("/:id/shorts")
  .get(checkValidId, authenticate, getShortsForCategory);

export default router;
