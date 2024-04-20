import db from "../../../database/database";
import { handleError } from "../../error/helper.error";
import { Middleware } from "express-validator/src/base";
import { PackForResponse } from "../type.pack";
import { getPacksForReturn } from "../helpers.pack";
import { getBlocksAsIdList } from "../../block/helpers.block";

/** Adds a Pack to a users bookmarks */
export const bookmarkPack: Middleware = async (req, res) => {
  try {
    await db.pack.update({
      where: {
        id: res.locals.id,
      },
      data: {
        User_bookmarkedByForPack: {
          connect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Successfully bookmarked pack" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};

/** Removes a Pack to a users bookmarks */
export const removeBookmarkFromPack: Middleware = async (req, res) => {
  try {
    await db.pack.update({
      where: {
        id: res.locals.id,
      },
      data: {
        User_bookmarkedByForPack: {
          disconnect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res
      .status(200)
      .send({ message: "Successfully removed Bookmark from the Pack" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};

/** Gets all bookmarked packs for a user */
export const getBookmarkedPacks: Middleware = async (req, res) => {
  try {
    const packs: PackForResponse[] = await getPacksForReturn({
      where: {
        User_bookmarkedByForPack: {
          some: {
            id: res.locals.user.id,
          },
        },
      },
      userId: res.locals.user.id,
      blockList: await getBlocksAsIdList(res.locals.user.id),
    });
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ error, res, rName: "Bookmakred Packs" });
  }
};
