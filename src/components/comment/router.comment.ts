import { Router } from "express";
import {
  checkValidId,
  checkValidatorResult,
} from "../../middleware/validation.middleware";

import authenticate from "../../middleware/authentication.middleware";
import { body } from "express-validator";
import {
  createCommentForPack,
  createCommentForShort,
  createSubcomment,
  deleteComment,
  downvoteComment,
  removeVoteForComment,
  reportComment,
  upvoteComment,
} from "./controller.comment";
import minLevel from "../../middleware/authorization.middleware";

const router: Router = Router();

router.route("/subcomment/:id").post(
  checkValidId,
  authenticate,
  minLevel(2),
  body("comment").exists().isString().escape(),
  checkValidatorResult({
    msg: "Make sure you are passing a 'comment' as a string.",
  }),
  createSubcomment,
);

router
  .route("/delete/:id")
  .delete(checkValidId, authenticate, minLevel(2), deleteComment);

router.route("/report/:id").post(
  checkValidId,
  authenticate,
  minLevel(2),
  body("reason").exists().isString(),
  checkValidatorResult({
    msg: "Make sure you are passing a 'reason' as a string.",
  }),
  reportComment,
);

router.route("/pack/:id").post(
  checkValidId,
  authenticate,
  minLevel(2),
  body("comment").exists().isString().escape(),
  checkValidatorResult({
    msg: "Please make sure you are passing a 'comment' as a string",
  }),

  authenticate,
  createCommentForPack,
);

router.route("/short/:id").post(
  checkValidId,
  authenticate,
  minLevel(2),
  body("comment").exists().isString().escape(),
  checkValidatorResult({
    msg: "Please make sure you are passing a 'comment' as a string",
  }),
  createCommentForShort,
);

router
  .route("/upvote/:id")
  .patch(checkValidId, authenticate, minLevel(2), downvoteComment);

router
  .route("/downvote/:id")
  .patch(checkValidId, authenticate, minLevel(2), upvoteComment);

router
  .route("/vote/remove/:id")
  .patch(checkValidId, authenticate, minLevel(2), removeVoteForComment);

// TODO: Implement route for getting subcomments of comment
// TODO: Show subcomment count

export default router;
