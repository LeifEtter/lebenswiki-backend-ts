import { Middleware } from "express-validator/src/base";
import db from "../../database/database";
import { handleError } from "../error/helper.error";

/** Creates user feedback */
export const createFeedBack: Middleware = async (req, res) => {
  try {
    const { type, content } = req.body;
    await db.feedback.create({
      data: {
        type: type,
        content: content,
        user: {
          connect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(201).send({ message: "Feedback created" });
  } catch (error) {
    return handleError({ error, res, rName: "Feedback" });
  }
};
