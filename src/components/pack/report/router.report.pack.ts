import { Router } from "express";
import {
  checkValidId,
  checkValidatorResult,
} from "../../../middleware/validation.middleware";
import authenticate from "../../../middleware/authentication.middleware";
import { body } from "express-validator";
import { getPackReports, reportPack } from "./controller.report.pack";
import minLevel from "../../../middleware/authorization.middleware";

const router: Router = Router();

router.route("/create/:id").post(
  checkValidId,
  authenticate,
  body("reason").exists().isString().escape(),
  checkValidatorResult({
    resource: "Report",
    msg: "Please make sure you are passing a 'reason' as a string.",
  }),
  reportPack,
);

router.route("/").get(checkValidId, authenticate, minLevel(10), getPackReports);

export default router;
