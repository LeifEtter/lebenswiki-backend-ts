import db from "../../database/database";
import { Router } from "express";
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

const router: Router = Router();

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
      convertCategoryForResponse(cat),
    );
    const allPacksCategory: CategoryForResponse = {
      id: 0,
      name: "Alle",
    };
    categoriesForReturn.unshift(allPacksCategory);
    return res.status(200).send(categoriesForReturn);
  } catch (err) {
    console.log(err);
    return res.status(501).send({ message: "Couldn't get Categories" });
  }
};

export const getPacksForCategory: Middleware = async (req, res) => {
  try {
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
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ error, res, rName: "Packs", rId: res.locals.id });
  }
};

export const getShortsForCategory: Middleware = async (req, res) => {
  try {
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
          await convertShortForResponse(res.locals.user.id, short),
      ),
    );
    return res.status(200).send(shortsToReturn);
  } catch (error) {
    return handleError({ rName: "Short", rId: 0, res, error });
  }
};

export const getAllPacksAndShortsWithCategories: Middleware = async (
  req,
  res,
) => {
  try {
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
      })),
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
    return res.status(200).send(categorizedPacksAndShorts);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: 0 });
  }
};
