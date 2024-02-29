import { Middleware } from "express-validator/src/base";
import { handleError } from "../error/helper.error";
import db from "../../database/database";
import { ShortForResponse, ShortFromQuery } from "./type.short";
import { convertShortForResponse, getShortsForResponse } from "./helper.short";
import { getBlocksAsIdList } from "../block/helpers.block";
import { CategoryForResponse } from "../category/type.category";

export const getAllShorts: Middleware = async (req, res) => {
  try {
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
          await convertShortForResponse(res.locals.user.id, short),
      ),
    );
    return res.status(200).send(shortsToReturn);
  } catch (error) {
    return handleError({ rName: "Short", res, error });
  }
};

export const createShort: Middleware = async (req, res) => {
  try {
    const canPublishImmediately = res.locals.user.role.level >= 3;
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
          await convertShortForResponse(res.locals.user.id, short),
      ),
    );
    return res.status(200).send(shortsForResponse);
  } catch (error) {
    return handleError({ res, error, rName: "Bookmarked Shorts" });
  }
};

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
          await convertShortForResponse(res.locals.user.id, short),
      ),
    );
    return res.status(200).send(shortsForResponse);
  } catch (error) {
    return handleError({ res, error, rName: "Published Shorts" });
  }
};

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
          await convertShortForResponse(res.locals.user.id, short),
      ),
    );
    return res.status(200).send(shortsForResponse);
  } catch (error) {
    return handleError({ res, error, rName: "Published Shorts" });
  }
};

export const getAllShortsWithCategories: Middleware = async (req, res) => {
  try {
    const categories = await db.category.findMany();
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
      })),
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
    return res.status(200).send(categorizedShorts);
  } catch (error) {
    return handleError({ res, error, rName: "Short" });
  }
};

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

export const publishShort: Middleware = async (req, res) => {
  try {
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

export const unpublishShort: Middleware = async (req, res) => {
  try {
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
