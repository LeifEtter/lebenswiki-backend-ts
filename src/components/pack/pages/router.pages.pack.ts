import { Router } from "express";
import authenticate from "../../../middleware/authentication.middleware";
import minLevel from "../../../middleware/authorization.middleware";
import { updatePages, uploadItemImage } from "./controller.pages.pack";
import multer = require("multer");
const upload = multer();

const router: Router = Router({ mergeParams: true });

router
  .route("/item/:itemId/uploadImage")
  .post(authenticate, minLevel(2), upload.single("image"), uploadItemImage);
router.route("/save").put(authenticate, minLevel(2), updatePages);

export default router;
