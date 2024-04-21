import { Middleware } from "express-validator/src/base";
import {
  getSignedUrlForImageViewing,
  uploadImageToS3,
} from "../../image/controller.image";
import db from "../../../database/database";
import { handleError } from "../../error/helper.error";
import { JsonPackPageItem } from "./type.pages.pack";

/** Uploads an image to S3 given a pack and item id */
export const uploadItemImage: Middleware = async (req, res) => {
  try {
    if (req.params == null || req.params.packId == null || !req.params.itemId) {
      return res.status(404).send({ message: "Pass proper id" });
    }
    const { packId, itemId } = req.params;
    if (
      (await db.pack.findFirst({ where: { id: packId } }))?.creatorId !=
      res.locals.user.id
    ) {
      return res.status(401).send({ message: "This isn't your pack" });
    }
    const imagePath: string = `packs/${packId}/pages/${itemId}.png`;
    await uploadImageToS3(imagePath, req.file!.buffer);
    const url = await getSignedUrlForImageViewing(imagePath);
    return res.status(201).send(url);
  } catch (error) {
    console.log(error);
    return res.status(501).send({ message: "Pack Image Couldn't be updated" });
  }
};

/** Given a pack id and pages, it replaces the pages of the pack with the passed pages */
export const updatePages: Middleware = async (req, res) => {
  try {
    const pack = await db.pack.findFirst({
      where: { id: parseInt(req.params!.packId) },
    });
    if (pack?.creatorId != res.locals.user.id) {
      return res.status(401).send({ message: "This isn't your pack" });
    }
    const pages = req.body;
    await db.packPage.deleteMany({
      where: {
        packId: parseInt(req.params!.packId),
      },
    });

    for (const page of pages) {
      const createdPage = await db.packPage.create({
        data: {
          id: page.id,
          pageNumber: page.pageNumber,
          type: page.type,
          pack: {
            connect: {
              id: parseInt(req.params!.packId),
            },
          },
        },
      });
      const items: JsonPackPageItem[] = page.items;
      for (const item of items) {
        if (item.headContent == null) {
          throw "Please provide head content for every pack page item";
        }
        const createdHeadContent = await db.packPageItemHeadContent.create({
          data: {
            id: item.headContent.id,
            value: item.headContent.value,
          },
        });
        const createdItem = await db.packPageItem.create({
          data: {
            id: item.id,
            type: item.type,
            PackPage: {
              connect: {
                id: createdPage.id,
              },
            },
            headContent: {
              connect: {
                id: createdHeadContent.id,
              },
            },
            position: item.position,
          },
        });
        if (item.bodyContent) {
          for (const bodyItem of item.bodyContent) {
            await db.packPageItemBodyContent.create({
              data: {
                id: bodyItem.id,
                value: bodyItem.value,
                isCorrectAnswer: bodyItem.isCorrectAnswer,
                parent: {
                  connect: {
                    id: createdItem.id,
                  },
                },
              },
            });
          }
        }
      }
    }
    return res.status(200).send({ message: "Saved" });
  } catch (error) {
    return handleError({ error, res, rName: "Pack" });
  }
};
