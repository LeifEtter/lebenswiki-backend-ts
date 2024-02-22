import { Router } from "express";
import {
  checkValidId,
  checkValidatorResult,
} from "../../middleware/validation.middleware";

import authenticate from "../../middleware/authentication.middleware";
import { body } from "express-validator";
import { blockUser, getMyBlocks, removeBlock } from "./controller.block";
import minLevel from "../../middleware/authorization.middleware";

const router: Router = Router();

router.route("/create/:id").post(
  checkValidId,
  authenticate,
  minLevel(2),
  body("reason").exists().isString().escape(),
  checkValidatorResult({
    msg: "Please make sure you're passing a 'reason', as a string.",
  }),
  blockUser,
);

router
  .route("/remove/:id")
  .delete(checkValidId, authenticate, minLevel(2), removeBlock);

router.route("/own").get(authenticate, minLevel(2), getMyBlocks);

export default router;
