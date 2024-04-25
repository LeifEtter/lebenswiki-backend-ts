import { Middleware } from "express-validator/src/base";
import { handleError } from "../error/helper.error";
import db from "../../database/database";
import { ShortForResponse, ShortFromQuery } from "./type.short";
import { convertShortForResponse, getShortsForResponse } from "./helper.short";
import { getBlocksAsIdList } from "../block/helpers.block";
import { CategoryForResponse } from "../category/type.category";
import cache from "../../cache/cache";
import { CACHE_DURATION } from "../../constants/misc";

/** Get All Shorts that weren't created by users the requester has blocked, and that are published */
export const getAllShorts: Middleware = async (req, res) => {
  try {
    const cacheKey: string = `shorts-getAll-${res.locals.user.id}`;
    const cachedRes = cache.get(cacheKey);
    if (cachedRes) return res.status(200).send(cachedRes);
    const shorts: ShortFromQuery[] = await db.short.findMany({
      where: {
        published: true,
        User_Short_creatorIdToUser: {
          id: {
            notIn: await getBlocksAsIdList(res.locals.user.id),
          },
        },
      },
      include: {
        User_Short_creatorIdToUser: true,
        User_bookmarkedBy: true,
        User_downVote: true,
        User_upVote: true,
        User_clap: true,
      },
    });
    const shortsToReturn: ShortForResponse[] = await Promise.all(
      shorts.map(
        async (short) =>
          await convertShortForResponse(res.locals.user.id, short)
      )
    );
    cache.set(cacheKey, shortsToReturn, CACHE_DURATION);
    return res.status(200).send(shortsToReturn);
  } catch (error) {
    return handleError({ rName: "Short", res, error });
  }
};

/** Create a short and publish it immediately if the user has a role level of 3 or higher */
export const createShort: Middleware = async (req, res) => {
  try {
    const canPublishImmediately = res.locals.user.role.level >= 3;
    if (canPublishImmediately) {
      cache.flushAll();
    }
    const { title, content, categories } = req.body;

    const short = await db.short.create({
      data: {
        title,
        content,
        published: canPublishImmediately,
        User_Short_creatorIdToUser: {
          connect: {
            id: res.locals.user.id,
          },
        },
        Category: {
          connect: categories.map((cat: CategoryForResponse) => cat),
        },
      },
    });
    return res.status(201).send({
      message: `Short was created and ${
        canPublishImmediately ? "requested to be" : ""
      } published`,
    });
  } catch (error) {
    return handleError({ rName: "Short", error, res });
  }
};

/** delete a users specific short */
export const deleteShort: Middleware = async (req, res) => {
  try {
    await db.short.delete({
      where: {
        id: res.locals.id,
        creatorId: res.locals.user.id,
      },
    });
    return res.status(200).send({ message: "Short deleted successfully" });
  } catch (error) {
    return handleError({ error, res, rName: "Short" });
  }
};

/** Get all shorts the requester has bookmarked */
export const getBookmarkedShorts: Middleware = async (req, res) => {
  try {
    const shorts = await db.short.findMany({
      where: {
        published: true,
        User_bookmarkedBy: {
          some: {
            id: res.locals.user.id,
          },
        },
      },
      include: {
        User_Short_creatorIdToUser: true,
        User_bookmarkedBy: true,
        User_downVote: true,
        User_upVote: true,
        User_clap: true,
      },
    });
    const shortsForResponse: ShortForResponse[] = await Promise.all(
      shorts.map(
        async (short) =>
          await convertShortForResponse(res.locals.user.id, short)
      )
    );
    return res.status(200).send(shortsForResponse);
  } catch (error) {
    return handleError({ res, error, rName: "Bookmarked Shorts" });
  }
};

/** Get all shorts the requester has published */
export const getOwnPublishedShorts: Middleware = async (req, res) => {
  try {
    const shorts = await db.short.findMany({
      where: { published: true, creatorId: res.locals.user.id },
      include: {
        User_Short_creatorIdToUser: true,
        User_bookmarkedBy: true,
        User_downVote: true,
        User_upVote: true,
        User_clap: true,
      },
    });
    const shortsForResponse: ShortForResponse[] = await Promise.all(
      shorts.map(
        async (short) =>
          await convertShortForResponse(res.locals.user.id, short)
      )
    );
    return res.status(200).send(shortsForResponse);
  } catch (error) {
    return handleError({ res, error, rName: "Published Shorts" });
  }
};

/** Get all shorts the requester hasn't published */
export const getOwnUnpublishedShorts: Middleware = async (req, res) => {
  try {
    const shorts = await db.short.findMany({
      where: { published: false, creatorId: res.locals.user.id },
      include: {
        User_Short_creatorIdToUser: true,
        User_bookmarkedBy: true,
        User_downVote: true,
        User_upVote: true,
        User_clap: true,
      },
    });
    const shortsForResponse: ShortForResponse[] = await Promise.all(
      shorts.map(
        async (short) =>
          await convertShortForResponse(res.locals.user.id, short)
      )
    );
    return res.status(200).send(shortsForResponse);
  } catch (error) {
    return handleError({ res, error, rName: "Published Shorts" });
  }
};

/** get all categories and the corresponding published shorts */
export const getAllShortsWithCategories: Middleware = async (req, res) => {
  try {
    const cacheKey: string = `shorts-getAll-${res.locals.user.id}`;
    const cachedRes = cache.get(cacheKey);
    const categories = await db.category.findMany();
    if (cachedRes) return res.status(200).send(cachedRes);
    const categorizedShorts: CategoryForResponse[] = await Promise.all(
      categories.map(async (cat) => ({
        id: cat.id,
        name: cat.categoryName,
        shorts: await getShortsForResponse({
          where: {
            published: true,
            Category: {
              some: {
                id: cat.id,
              },
            },
          },
          userId: res.locals.user.id,
          blockList: await getBlocksAsIdList(res.locals.user.id),
        }),
      }))
    );
    const allShorts: ShortForResponse[] = await getShortsForResponse({
      where: { published: true },
      userId: res.locals.user.id,
      blockList: [],
    });
    const allShortsCategory: CategoryForResponse = {
      id: 0,
      name: "Alle",
      shorts: allShorts,
    };
    categorizedShorts.unshift(allShortsCategory);
    cache.set(cacheKey, allShortsCategory, CACHE_DURATION);
    return res.status(200).send(categorizedShorts);
  } catch (error) {
    return handleError({ res, error, rName: "Short" });
  }
};

/** Add a clap for a short */
export const clapForShort: Middleware = async (req, res) => {
  try {
    await db.short.update({
      where: { id: res.locals.id },
      data: {
        User_clap: {
          connect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Clapped for Short" });
  } catch (error) {
    return handleError({ res, error, rName: "Short" });
  }
};

/** Publish a short */
export const publishShort: Middleware = async (req, res) => {
  try {
    cache.flushAll();
    await db.short.update({
      where: { id: res.locals.id, creatorId: res.locals.user.id },
      data: {
        published: true,
      },
    });
    return res.status(200).send({ message: "Short published" });
  } catch (error) {
    return handleError({ res, error, rName: "Short" });
  }
};

/** Unpublish a short */
export const unpublishShort: Middleware = async (req, res) => {
  try {
    cache.flushAll();
    await db.short.update({
      where: { id: res.locals.id, creatorId: res.locals.user.id },
      data: {
        published: false,
      },
    });
    return res.status(200).send({ message: "Short unpublished" });
  } catch (error) {
    return handleError({ res, error, rName: "Short" });
  }
};

/** Bookmark a Short */
export const bookmarkShort: Middleware = async (req, res) => {
  try {
    await db.short.update({
      where: {
        id: res.locals.id,
      },
      data: {
        User_bookmarkedBy: {
          connect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Successfully bookmarked Short" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};

/** Remove a short from users bookmarks */
export const unbookmarkShort: Middleware = async (req, res) => {
  try {
    await db.short.update({
      where: {
        id: res.locals.id,
      },
      data: {
        User_bookmarkedBy: {
          disconnect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Successfully unbookmarked Short" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};

/** Create a report for a short */
export const reportShort: Middleware = async (req, res) => {
  try {
    const reason: string = req.body.reason;
    const short = await db.short.findUnique({
      where: {
        id: res.locals.id,
      },
    });
    if (short == null) {
      return res.status(404).send({ message: "Short not found" });
    }
    if (short.creatorId == res.locals.user.id) {
      return res.status(401).send({ message: "Can't Report own short" });
    }
    await db.report.create({
      data: {
        reason: reason,
        User: {
          connect: {
            id: res.locals.user.id,
          },
        },
        Short: {
          connect: {
            id: short.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Successfully Report Short" });
  } catch (error) {
    return handleError({ res, error, rName: "Short" });
  }
};
