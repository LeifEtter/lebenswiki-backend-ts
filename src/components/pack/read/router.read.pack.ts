import { body, validationResult } from "express-validator";

import authenticate from "../../../middleware/authentication.middleware";
import {
  checkValidId,
  checkValidatorResult,
} from "../../../middleware/validation.middleware";
import { Router } from "express";
import { createReadForPack, updateReadForPack } from "./controller.read.pack";

const router: Router = Router();

router.route("/update/:id").patch(
  checkValidId,

  authenticate,
  body("progress").exists().isNumeric(),
  checkValidatorResult({
    msg: "Please make sure to pass 'progress' with an integer",
  }),
  updateReadForPack,
);

router.route("/create/:id").post(
  checkValidId,

  authenticate,
  body("progress").exists().isNumeric(),
  checkValidatorResult({
    msg: "Please make sure to pass 'progress' with an integer",
  }),
  createReadForPack,
);

export default router;
