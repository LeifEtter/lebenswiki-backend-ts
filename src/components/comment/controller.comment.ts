import db from "../../database/database";
import { handleError } from "../error/helper.error";
import { Middleware } from "express-validator/src/base";

export const createCommentForShort: Middleware = async (req, res) => {
  try {
    // TODO If necessary block user from creating comment if user is blocked, otherwise just stick to filtering comments
    const { comment } = req.body;
    const commentResult = await db.comment.create({
      data: {
        commentResponse: comment,
        User_Comment_creatorIdToUser: {
          connect: {
            id: res.locals.user.id,
          },
        },
        Short: {
          connect: {
            id: res.locals.id,
          },
        },
      },
    });
    return res.status(201).send({
      message: `Commented on Short with ID = ${res.locals.id} successfully`,
      commentId: commentResult.id,
    });
  } catch (error) {
    return handleError({ res, rName: "Short", rId: res.locals.id, error });
  }
};

export const createCommentForPack: Middleware = async (req, res) => {
  try {
    // TODO If necessary block user from creating comment if user is blocked, otherwise just stick to filtering comments
    const { comment } = req.body;
    const commentResult = await db.comment.create({
      data: {
        commentResponse: comment,
        User_Comment_creatorIdToUser: {
          connect: {
            id: res.locals.user.id,
          },
        },
        Pack: {
          connect: {
            id: res.locals.id,
          },
        },
      },
    });
    return res.status(201).send({
      message: `Commented on Pack with ID = ${res.locals.id} successfully`,
      commentId: commentResult.id,
    });
  } catch (error) {
    return handleError({ res, rName: "Pack", rId: res.locals.id, error });
  }
};

export const createSubcomment: Middleware = async (req, res) => {
  try {
    const comment = await db.comment.findUniqueOrThrow({
      where: {
        id: res.locals.id,
      },
    });
    if (!comment) {
      return res.status(404).send({
        message: "Resource could not be",
      });
    }
    const commentResponse = await db.comment.create({
      data: {
        commentResponse: req.body.comment,
        User_Comment_creatorIdToUser: {
          connect: {
            id: res.locals.id,
          },
        },
      },
    });
    return res.status(201).send({ message: "Comment created successfully" });
  } catch (error) {
    handleError({
      res,
      error,
      rName: "Subcomment",
      rId: res.locals.id,
    });
  }
};
export const deleteComment: Middleware = async (req, res) => {
  try {
    await db.comment.delete({
      where: {
        id: res.locals.id,
        creatorId: res.locals.user.id,
      },
    });
    return res
      .status(200)
      .send({ message: "Comment has been deleted successfully" });
  } catch (error) {
    return handleError({
      error,
      res,
      rName: "Comment",
      rId: res.locals.id,
      message:
        "Something went wrong while deleting your comment, please contact us immediately if it needs to be removed",
    });
  }
};

export const reportComment: Middleware = async (req, res) => {
  try {
    await db.report.create({
      data: {
        reason: req.body.reason,
        Comment: {
          connect: {
            id: res.locals.id,
          },
        },
      },
    });
  } catch (error) {
    return handleError({
      res,
      error,
      rName: "Comment",
      rId: res.locals.id,
      message:
        "Failed to delete Pack, please contact support immediately if you need the pack removed or unpublished",
    });
  }
};

export const downvoteComment: Middleware = async (req, res) => {
  try {
    await db.comment.update({
      where: { id: res.locals.id },
      data: {
        User_commentDownVote: {
          connect: {
            id: res.locals.user.id,
          },
        },
        User_commentUpVote: {
          disconnect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Comment downvoted" });
  } catch (error) {
    return handleError({ rName: "Comment", rId: res.locals.id, res, error });
  }
};

export const upvoteComment: Middleware = async (req, res) => {
  try {
    await db.comment.update({
      where: { id: res.locals.id },
      data: {
        User_commentDownVote: {
          disconnect: {
            id: res.locals.user.id,
          },
        },
        User_commentUpVote: {
          connect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Comment upvoted" });
  } catch (error) {
    return handleError({ rName: "Comment", rId: res.locals.id, res, error });
  }
};

export const removeVoteForComment: Middleware = async (req, res) => {
  try {
    await db.comment.update({
      where: { id: res.locals.id },
      data: {
        User_commentDownVote: {
          disconnect: {
            id: res.locals.user.id,
          },
        },
        User_commentUpVote: {
          disconnect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res
      .status(200)
      .send({ message: "Vote removed from comment successfully" });
  } catch (error) {
    return handleError({ rName: "Comment", rId: res.locals.id, res, error });
  }
};
