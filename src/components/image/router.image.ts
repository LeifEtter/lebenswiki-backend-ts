import { Router } from "express";
import { deleteAvatar, uploadAvatar } from "./controller.image";

import authenticate from "../../middleware/authentication.middleware";
import multer from "multer";
import minLevel from "../../middleware/authorization.middleware";

const upload = multer();
const router: Router = Router();

router
  .route("/avatar/upload")
  .post(authenticate, minLevel(2), upload.single("avatar"), uploadAvatar);

router.route("/avatar/delete").delete(authenticate, minLevel(2), deleteAvatar);

export default router;
