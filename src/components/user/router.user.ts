import { Router } from "express";
import {
  checkValidId,
  checkValidatorResult,
} from "../../middleware/validation.middleware";
import { body } from "express-validator";
import {
  blockUser,
  checkToken,
  defaultAvatar,
  getUsersProfile,
  login,
  register,
  showProfile,
  unblockUser,
  updateProfile,
} from "./controller.user";
import authenticate from "../../middleware/authentication.middleware";
import { deleteAvatar } from "../image/controller.image";
import minLevel from "../../middleware/authorization.middleware";
import db from "../../database/database";
import bcrypt = require("bcrypt");

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

router.route("/defaultAvatar").patch(authenticate, defaultAvatar);

router.route("/block/:id").post(
  checkValidId,
  authenticate,
  minLevel(2),
  body("reason").exists().isString().escape(),
  checkValidatorResult({
    resource: "Block",
    msg: "Please make sure to pass a 'reason' as a string.",
  }),
  blockUser,
);

router
  .route("/unblock/:id")
  .delete(checkValidId, authenticate, minLevel(2), unblockUser);

router.route("/delete/special").post(async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).send("Please enter a valid email");
    }
    if (!req.body.password) {
      return res.status(400).send("Please enter a valid password");
    }
    const user = await db.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (!user) {
      return res.status(401).send("User not found or password is invalid");
    }
    const passwordIsValid: boolean = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!passwordIsValid) {
      return res.status(401).send("User not found or password is invalid");
    }
    if (passwordIsValid) {
      await db.user.delete({ where: { email: req.body.email } });
      return res.status(200).send("Deleted");
    }
  } catch (error) {
    return res.status(501).send("Something went wrong");
  }
});

export default router;
