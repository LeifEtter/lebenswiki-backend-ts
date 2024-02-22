import { Router } from "express";
import { checkValidId } from "../../../middleware/validation.middleware";

import authenticate from "../../../middleware/authentication.middleware";
import {
  bookmarkPack,
  getBookmarkedPacks,
  removeBookmarkFromPack,
} from "./controller.bookmark.pack";
import minLevel from "../../../middleware/authorization.middleware";

const router: Router = Router();

router.route("/create/:id").patch(checkValidId, authenticate, bookmarkPack);

router
  .route("/remove/:id")
  .patch(checkValidId, authenticate, removeBookmarkFromPack);

router.route("/").get(authenticate, minLevel(2), getBookmarkedPacks);

export default router;
