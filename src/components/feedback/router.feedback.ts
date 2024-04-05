import { Router } from "express";
import { createFeedBack } from "./controller.feedback";
import authenticate from "../../middleware/authentication.middleware";
import { body } from "express-validator";

const router: Router = Router();

router
  .route("/create")
  .post(
    body(["type", "content"]).exists().isString().escape(),
    authenticate,
    createFeedBack,
  );

export default router;
