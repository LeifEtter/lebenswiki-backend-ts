import db, { block } from "../../database/database";
import { Router } from "express";
import _ from "lodash";
import { handleError } from "../error/helper.error";
import { getBlocksAsIdList } from "../block/helpers.block";
import {
  convertPackForResponse,
  getPacksForReturn,
  savePages,
} from "./helpers.pack";
import { Middleware } from "express-validator/src/base";
import { PackForResponse } from "./type.pack";
import { Category } from "@prisma/client";
import { CategoryForResponse } from "../category/type.category";

const router: Router = Router();

export const updatePack: Middleware = async (req, res) => {
  try {
    const { title, description, initiative, readTime, pages } = req.body;
    const prevPack = await db.pack.findUnique({
      where: { id: res.locals.id },
      include: { Category: true },
    });
    const catsToDisconnect = prevPack?.Category.map((cat) => cat.id).filter(
      (item) => req.body.categories.indexOf(item) < 0,
    );
    const pack = await db.pack.update({
      where: {
        id: res.locals.id,
        User_Pack_creatorIdToUser: {
          id: res.locals.user.id,
        },
      },
      data: {
        title: title,
        description: description,
        initiative: initiative,
        readTime: readTime,
        reactions: [],
        pages: pages,
        User_Pack_creatorIdToUser: {
          connect: {
            id: res.locals.user.id,
          },
        },
        Category: {
          disconnect: catsToDisconnect?.map((id) => ({ id: id })),
          connect: req.body.categories.map((catId: number) => ({
            id: catId,
          })),
        },
      },
      include: {
        Category: true,
      },
    });
    return res.status(200).send({ message: "Pack updated successfully", pack });
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const createPack: Middleware = async (req, res) => {
  try {
    const { title, description, initiative, readTime, pages } = req.body;
    const packResult = await db.pack.create({
      data: {
        title: title,
        description: description,
        initiative: initiative,
        readTime: readTime,
        reactions: [],
        User_Pack_creatorIdToUser: {
          connect: {
            id: res.locals.user.id,
          },
        },
        Category: {
          connect: req.body.categories.map((catId: number) => ({
            id: catId,
          })),
        },
      },
    });
    await savePages({
      packId: packResult.id,
      pagesJson: pages,
      isUpdate: false,
    });
    return res
      .status(201)
      .send({ message: "Pack Creation successful", pack: packResult });
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const viewPack: Middleware = async (req, res) => {
  try {
    const blockList: number[] = await getBlocksAsIdList(
      res.locals.user.id ?? [],
    );
    const packs: PackForResponse[] = await getPacksForReturn({
      where: {
        id: res.locals.id,
      },
      userId: res.locals.user.id,
      blockList,
      includeComments: true,
      includePages: true,
    });
    return res.status(200).send(packs[0]);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const getOwnUnpublished: Middleware = async (req, res) => {
  try {
    const blockList: number[] = await getBlocksAsIdList(res.locals.user.id);
    const packs = await getPacksForReturn({
      where: {
        creatorId: res.locals.user.id,
        published: false,
      },
      userId: res.locals.user.id,
      blockList,
    });
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const getOwnPublished: Middleware = async (req, res) => {
  try {
    const blockList: number[] = await getBlocksAsIdList(res.locals.user.id);
    const packs = await getPacksForReturn({
      where: {
        creatorId: res.locals.user.id,
        published: true,
      },
      userId: res.locals.user.id,
      blockList,
    });
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const getReadPacks: Middleware = async (req, res) => {
  try {
    const blockList: number[] = await getBlocksAsIdList(res.locals.user.id);
    const packs = await getPacksForReturn({
      where: {
        published: true,
        Read: {
          some: {
            userId: res.locals.user.id,
          },
        },
      },
      userId: res.locals.user.id,
      blockList,
    });
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const getUnreadPacks: Middleware = async (req, res) => {
  try {
    const blockList: number[] = await getBlocksAsIdList(res.locals.user.id);
    const packs = await getPacksForReturn({
      where: {
        published: true,
        Read: {
          none: {
            userId: res.locals.user.id,
          },
        },
      },
      userId: res.locals.user.id,
      blockList,
    });
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const publishPack: Middleware = async (req, res) => {
  try {
    await db.pack.update({
      where: { id: res.locals.id, creatorId: res.locals.user.id },
      data: {
        published: true,
      },
    });
    return res.status(200).send({ message: "Pack Published successfully" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const unpublishPack: Middleware = async (req, res) => {
  try {
    await db.pack.update({
      where: { id: res.locals.id, creatorId: res.locals.user.id },
      data: {
        published: false,
      },
    });
    return res.status(200).send({ message: "Pack Unpublished successfully" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const deleteOwnPack: Middleware = async (req, res) => {
  try {
    await db.pack.delete({
      where: { id: res.locals.id, creatorId: res.locals.user.id },
    });
    return res.status(200).send({ message: "Pack Deleted successfully" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const getAllPacks: Middleware = async (req, res) => {
  try {
    const blockList: number[] = await getBlocksAsIdList(res.locals.user.id);
    const packs = await getPacksForReturn({
      where: {
        published: true,
      },
      userId: res.locals.user.id,
      blockList,
    });
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};

export const getAllPacksWithCategories: Middleware = async (req, res) => {
  try {
    const categories = await db.category.findMany();
    const categorizedPacks: CategoryForResponse[] = await Promise.all(
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
      })),
    );
    const allPacks: PackForResponse[] = await getPacksForReturn({
      where: { published: true },
      userId: res.locals.user.id,
      blockList: await getBlocksAsIdList(res.locals.user.id),
    });
    const allPacksCategory: CategoryForResponse = {
      id: 0,
      name: "Alle",
      packs: allPacks,
    };
    categorizedPacks.unshift(allPacksCategory);
    return res.status(200).send(categorizedPacks);
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: 0 });
  }
};

export const clapForPack: Middleware = async (req, res) => {
  try {
    await db.pack.update({
      where: { id: res.locals.id },
      data: {
        User_userClap: {
          connect: {
            id: res.locals.user.id,
          },
        },
      },
    });
    return res.status(200).send({ message: "Clapped for pack" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack", rId: res.locals.id });
  }
};
