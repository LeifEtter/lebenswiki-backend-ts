import db from "../../database/database";
import _ from "lodash";
import { handleError } from "../error/helper.error";
import { getBlocksAsIdList } from "../block/helpers.block";
import { getPacksForReturn } from "./helpers.pack";
import { Middleware } from "express-validator/src/base";
import { PackForResponse } from "./type.pack";
import { Category } from "@prisma/client";
import { CategoryForResponse } from "../category/type.category";
import {
  getSignedUrlForCover,
  uploadImageToS3,
} from "../image/controller.image";

export const updatePack: Middleware = async (req, res) => {
  try {
    const { title, description, initiative, readTime, pages } = req.body;
    const prevPack = await db.pack.findUnique({
      where: { id: res.locals.id },
      include: { Category: true },
    });
    if (prevPack?.creatorId != res.locals.user.id) {
      return res
        .status(401)
        .send({ message: "You have to be owner of this pack" });
    }
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
        User_Pack_creatorIdToUser: {
          connect: {
            id: res.locals.user.id,
          },
        },
        Category: {
          disconnect: catsToDisconnect?.map((id) => ({ id: id })),
          connect: req.body.categories.map((cat: Category) => cat),
        },
      },
      include: {
        Category: true,
      },
    });

    return res.status(200).send(pack);
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
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
          connect: req.body.categories.map((cat: Category) => cat),
        },
      },
    });
    const packsForResponse: PackForResponse[] = await getPacksForReturn({
      where: {
        id: packResult.id,
      },
      userId: res.locals.user.id,
      blockList: [],
    });
    return res.status(201).send(packsForResponse[0]);
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
  }
};

export const deleteOwnPack: Middleware = async (req, res) => {
  try {
    await db.pack.delete({
      where: { id: res.locals.id, creatorId: res.locals.user.id },
    });
    return res.status(200).send({ message: "Pack Deleted successfully" });
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};

export const getAllPacks: Middleware = async (req, res) => {
  try {
    const packs = await getPacksForReturn({
      where: {
        published: true,
      },
      userId: res.locals.user != null ? res.locals.user.id : 1,
      blockList:
        res.locals.user.id != null
          ? await getBlocksAsIdList(res.locals.user.id)
          : [],
    });
    return res.status(200).send(packs);
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
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
    return handleError({ res, error, rName: "Pack" });
  }
};

export const uploadPackImage: Middleware = async (req, res) => {
  try {
    await uploadImageToS3(`packs/${res.locals.id}/cover.png`, req.file!.buffer);
    const url = await getSignedUrlForCover(res.locals.id);
    return res.status(201).send(url);
  } catch (error) {
    console.log(error);
    return res.status(501).send({ message: "Pack Image Couldn't be updated" });
  }
};

export const getQuizById: Middleware = async (req, res) => {
  try {
    const page = await db.packPage.findFirst({
      where: {
        id: res.locals.id,
        type: "PageType.quiz",
      },
      include: {
        items: {
          include: {
            headContent: true,
            bodyContent: true,
          },
        },
      },
    });
    if (page == null) {
      return res
        .status(404)
        .send({ message: "No quiz with hits Id could be found" });
    }
    return res.status(200).send(page);
  } catch (error) {
    console.log(error);
    return res.status(501).send({ message: "Quiz couldn't be retrieved" });
  }
};
