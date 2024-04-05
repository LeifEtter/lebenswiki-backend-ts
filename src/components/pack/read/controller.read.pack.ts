import db from "../../../database/database";
import { Prisma } from "@prisma/client";
import { handleError } from "../../error/helper.error";
import { Middleware } from "express-validator/src/base";

export const updateReadForPack: Middleware = async (req, res) => {
  try {
    const recordsUpdated: Prisma.BatchPayload = await db.read.updateMany({
      where: {
        userId: res.locals.user.id,
        packId: res.locals.id,
      },
      data: {
        progress: req.body.progress,
      },
    });
    if (recordsUpdated.count == 0) {
      return res.status(404).send({ message: "Read couldn't be found" });
    }
    return res.status(200).send({
      message: `Reads progress successfully updated to ${req.body.progress}`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(501)
      .send({ message: "Something went wrong updating the Read" });
  }
};

export const createReadForPack: Middleware = async (req, res) => {
  try {
    const existingRead = await db.read.findFirst({
      where: {
        userId: res.locals.user.id,
        packId: res.locals.id,
      },
    });
    //TODO Bad code
    if (existingRead) {
      await db.read.updateMany({
        where: {
          userId: res.locals.user.id,
          packId: res.locals.id,
        },
        data: { progress: 1 },
      });
      return res
        .status(201)
        .send({
          message: "You have already created a read for this pack, its ok",
        });
    }
    const readResult = await db.read.create({
      data: {
        progress: 1,
        User: {
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
    return res
      .status(201)
      .send({ message: "Read Pack successfully", read: readResult });
  } catch (error) {
    return handleError({ error, res, rName: "Pack" });
  }
};
