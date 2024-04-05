import db from "../../database/database";
import { handleError } from "../error/helper.error";
import { Middleware } from "express-validator/src/base";

export const removeBlock: Middleware = async (req, res) => {
  try {
    const userToUnblockId = res.locals.id;
    const blocked = await db.block.findFirst({
      where: {
        blockedId: userToUnblockId,
        blockerId: res.locals.user.id,
      },
    });
    if (!blocked) {
      return res.status(404).send({
        id: 10,
        message: "Couldn't unblock user, you may have not blocked him",
      });
    } else {
      await db.block.deleteMany({
        where: {
          blockedId: userToUnblockId,
          blockerId: res.locals.user.id,
        },
      });
      return res.status(201).send({
        message: `Successfully unblocked user with ID = ${userToUnblockId}`,
      });
    }
  } catch (error) {
    return res.status(501).send({
      id: 9,
      message:
        "You were unable to block the user, in case it's urgent please contact us immediately",
    });
  }
};

export const blockUser: Middleware = async (req, res) => {
  try {
    if (res.locals.id == res.locals.user.id) {
      return res
        .status(400)
        .send({ id: 12, message: "You can't block yourself" });
    }
    const alreadyBlocked = await db.block.findFirst({
      where: {
        blockedId: res.locals.id,
        blockerId: res.locals.user.id,
      },
    });
    if (alreadyBlocked) {
      return res
        .status(400)
        .send({ id: 11, message: "You have already blocked this user" });
    } else {
      await db.block.create({
        data: {
          reason: req.body.reason,
          blockedId: res.locals.id,
          blockerId: res.locals.user.id,
        },
      });
      return res.status(201).send({
        message: `Successfully blocked user with ID = ${res.locals.id}`,
      });
    }
  } catch (error) {
    return handleError({ error, rName: "User", res });
  }
};

export const getMyBlocks: Middleware = async (req, res) => {
  try {
    const blocks = await db.block.findMany({
      where: {
        blockerId: res.locals.user.id,
      },
      include: {
        User_Block_blockedIdToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    const myBlocks = blocks.map((block) => ({
      userName: block.User_Block_blockedIdToUser.id,
      userId: block.User_Block_blockedIdToUser.name,
    }));
    return res.status(200).send(myBlocks);
  } catch (error) {
    return handleError({
      res,
      error,
      rName: "Blocked User",
    });
  }
};
