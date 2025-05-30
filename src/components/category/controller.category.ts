import db from "../../database/database";
import { handleError } from "../error/helper.error";
import { getPacksForReturn } from "../pack/helpers.pack";
import { getBlocksAsIdList } from "../block/helpers.block";
import { Middleware } from "express-validator/src/base";
import { ShortForResponse } from "../short/type.short";
import {
  convertShortForResponse,
  getShortsForResponse,
} from "../short/helper.short";
import { CategoryForResponse } from "./type.category";
import { convertCategoryForResponse } from "./helpers.category";
import { PackForResponse } from "../pack/type.pack";
import cache from "../../cache/cache";
import { CACHE_DURATION } from "../../constants/misc";
import logger from "../../logging/logger";

/** Get All Categories */
export const getAllCategories: Middleware = async (req, res) => {
  try {
    const categories = await db.category.findMany({
      select: {
        id: true,
        categoryName: true,
      },
      orderBy: {
        id: "asc",
      },
    });
    const categoriesForReturn: CategoryForResponse[] = categories.map((cat) =>
      convertCategoryForResponse(cat)
    );
    const allPacksCategory: CategoryForResponse = {
      id: 0,
      name: "Alle",
    };
    categoriesForReturn.unshift(allPacksCategory);
    return res.status(200).send(categoriesForReturn);
  } catch (err) {
    logger.error(err);
    return res.status(501).send({ message: "Couldn't get Categories" });
  }
};

/** Given a category id, retrieve all packs for that category */
export const getPacksForCategory: Middleware = async (req, res) => {
  try {
    const cacheKey: string = `category-getPacksForCategory-${res.locals.id}-${res.locals.user.id}`;
    const cachedRes = cache.get(cacheKey);
    if (cachedRes) return res.status(200).send(cachedRes);
    const packs = await getPacksForReturn({
      where: {
        published: true,
        Category: {
          some: {
            id: res.locals.id,
          },
        },
      },
      userId: res.locals.user.id,
      blockList: await getBlocksAsIdList(res.locals.user.id),
    });
    cache.set(cacheKey, packs, CACHE_DURATION);
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ error, res, rName: "Packs" });
  }
};

/** Given a Category id, retrieve all shorts for that category */
export const getShortsForCategory: Middleware = async (req, res) => {
  try {
    const cacheKey: string = `category-getShortsForCategory-${res.locals.id}-${res.locals.user.id}`;
    const cachedRes = cache.get(cacheKey);
    if (cachedRes) return res.status(200).send(cachedRes);
    const shorts = await db.short.findMany({
      where: {
        Category: {
          some: {
            id: res.locals.id,
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

//TODO Remove unused function
export const getAllPacksAndShortsWithCategories: Middleware = async (
  req,
  res
) => {
  try {
    const cacheKey: string = `packs-getAll-${res.locals.user.id}`;
    const cachedRes = cache.get(cacheKey);
    if (cachedRes) return res.status(200).send(cachedRes);
    const categories = await db.category.findMany();
    const categorizedPacksAndShorts: CategoryForResponse[] = await Promise.all(
      categories.map(async (cat) => ({
        id: cat.id,
        name: cat.categoryName,
        packs: await getPacksForReturn({
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
    const allPacks: PackForResponse[] = await getPacksForReturn({
      where: { published: true },
      userId: res.locals.user.id,
      blockList: await getBlocksAsIdList(res.locals.user.id),
    });
    const allShorts: ShortForResponse[] = await getShortsForResponse({
      where: { published: true },
      userId: res.locals.user.id,
      blockList: await getBlocksAsIdList(res.locals.user.id),
    });
    const allPacksAndShortsCategory: CategoryForResponse = {
      id: 0,
      name: "Alle",
      packs: allPacks,
      shorts: allShorts,
    };
    categorizedPacksAndShorts.unshift(allPacksAndShortsCategory);
    cache.set(cacheKey, categorizedPacksAndShorts, CACHE_DURATION);
    return res.status(200).send(categorizedPacksAndShorts);
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};
