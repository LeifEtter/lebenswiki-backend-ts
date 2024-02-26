import { Router } from "express";
import {
  checkValidId,
  checkValidatorResult,
} from "../../middleware/validation.middleware";
import { body } from "express-validator";
import {
  checkToken,
  getUsersProfile,
  login,
  register,
  showProfile,
  updateProfile,
} from "./controller.user";
import authenticate from "../../middleware/authentication.middleware";

import { deleteAvatar } from "../image/controller.image";
import minLevel from "../../middleware/authorization.middleware";

const router: Router = Router();

router.route("/checkToken").get(authenticate, minLevel(2), checkToken);

router.route("/register").post(
  body("email").exists().escape().isEmail(),
  body("password").exists().escape().isStrongPassword({
    minSymbols: 1,
    minUppercase: 1,
    minLength: 6,
  }),
  body("name").exists().escape().isString().isLength({ min: 3 }),
  body("biography").escape().isString(),
  checkValidatorResult({
    resource: "User",
    msg: "Please make sure you are passing an email, password, name and biography.",
  }),
  register,
);

router.route("/login").post(
  body(["email", "password"]).exists().isString().escape(),
  checkValidatorResult({
    resource: "User",
    msg: "Please make sure you are passing an email and a password.",
  }),
  login,
);

router.route("/profile/update").patch(
  authenticate,
  body("email").escape().isEmail(),
  body("name").escape().isString().isLength({ min: 3 }),
  body("biography").escape().isString(),
  checkValidatorResult({
    resource: "User",
    msg: "Please make sure that Email, Name and Biography are formatted correctly",
  }),
  minLevel(2),
  updateProfile,
);

router.route("/profile").get(authenticate, minLevel(2), showProfile);

router
  .route("/self/delete")
  .delete(checkValidId, authenticate, minLevel(2), deleteAvatar);

router.route("/:id").get(checkValidId, authenticate, getUsersProfile);

export default router;
