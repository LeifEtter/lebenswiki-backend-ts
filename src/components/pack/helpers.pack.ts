import { Prisma, User } from "@prisma/client";
import { PackForResponse, PackFromQuery } from "./type.pack";
import { CategoryForResponse } from "../category/type.category";
import db, { block } from "../../database/database";
import { getBlocksAsIdList } from "../block/helpers.block";
import { convertUserForResponse } from "../user/helpers.user";
import { convertCategoryForResponse } from "../category/helpers.category";
import { UserForResponse } from "../user/type.user";
import { convertCommentForResponse } from "../comment/helper.comment";
import { CommentForResponse } from "../comment/type.comment";

const checkIfUserHasBookmarked = (userId: number, bookmarks: User[]) => {
  const bookmarkMadeByUser = bookmarks.filter((user) => user.id == userId);
  if (bookmarkMadeByUser.length > 0) {
    return true;
  } else {
    return false;
  }
};

const checkIfUserHasClapped = (userId: number, claps: User[]) => {
  const clappedByUser = claps.filter((user) => user.id == userId);
  if (clappedByUser.length > 0) {
    return true;
  } else {
    return false;
  }
};

type ConvertPackForResponseParams = {
  userId: number;
  pack: PackFromQuery;
  includeComments?: boolean;
  includePages?: boolean;
};

export const convertPackForResponse = async ({
  userId,
  pack,
  includeComments,
  includePages,
}: ConvertPackForResponseParams): Promise<PackForResponse> => {
  const userHasBookmarked: boolean = checkIfUserHasBookmarked(
    userId,
    pack.User_bookmarkedByForPack,
  );
  const userHasClapped: boolean = checkIfUserHasClapped(
    userId,
    pack.User_userClap,
  );
  const totalClaps: number = pack.User_userClap.length;
  const totalBookmarks: number = pack.User_bookmarkedByForPack.length;
  const readProgress: number = pack.Read.length > 0 ? pack.Read[0].progress : 0;
  const creator: UserForResponse = await convertUserForResponse(
    pack.User_Pack_creatorIdToUser!,
  );
  const categories: CategoryForResponse[] = pack.Category.map((cat) =>
    convertCategoryForResponse(cat),
  );
  let comments: CommentForResponse[] = [];
  if (includeComments) {
    comments = await Promise.all(
      pack.Comment.map(
        async (comment) => await convertCommentForResponse({ comment, userId }),
      ),
    );
  }
  return {
    id: pack.id,
    title: pack.title,
    description: pack.description,
    creationDate: pack.creationDate,
    readTime: pack.readTime,
    creator,
    initiative: pack.initiative,
    readProgress,
    totalBookmarks,
    userHasBookmarked,
    userHasClapped,
    categories,
    totalClaps,
    comments: comments.length != 0 ? comments : undefined,
    pagesNew: includePages ? pack.pagesNew : undefined,
    published: pack.published,
  };
};

type GetPacksForReturnParams = {
  where: Prisma.PackWhereInput;
  userId: number;
  blockList: number[];
  includeComments?: boolean;
  includePages?: boolean;
};

export const getPacksForReturn = async ({
  where,
  userId,
  blockList,
  includeComments,
  includePages,
}: GetPacksForReturnParams): Promise<PackForResponse[]> => {
  try {
    const packs: PackFromQuery[] = await db.pack.findMany({
      where: {
        User_Pack_creatorIdToUser: {
          id: {
            notIn: blockList,
          },
        },
        ...where,
      },
      include: {
        User_Pack_creatorIdToUser: true,
        User_bookmarkedByForPack: true,
        User_userClap: true,
        Category: { select: { id: true, categoryName: true } },
        Read: {
          where: { userId: userId },
          select: { progress: true },
        },
        Comment: {
          where: {
            id: {
              notIn: blockList,
            },
          },
          include: {
            User_commentDownVote: true,
            User_commentUpVote: true,
            User_Comment_creatorIdToUser: true,
          },
        },
        pagesNew: {
          select: {
            id: true,
            pageNumber: true,
            items: {
              select: {
                id: true,
                type: true,
                headContent: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
                bodyContent: {
                  select: {
                    id: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const packsForResponse: PackForResponse[] = await Promise.all(
      packs.map(
        async (pack: PackFromQuery) =>
          await convertPackForResponse({
            userId,
            pack,
            includeComments,
            includePages,
          }),
      ),
    );
    return packsForResponse;
  } catch (error) {
    console.log("Error while trying to retrieve packs for return");
    throw error;
  }
};

type PackPage = {
  pageNumber: number;
  items: [];
};

type PackPageItem = {
  type: string;
  bodyContent?: PackPageItemContent[];
  headContent?: PackPageItemContent;
};

type PackPageItemContent = {
  value: string;
};

type SavePagesParams = {
  isUpdate: boolean;
  pagesJson: PackPage[];
  packId: number;
};

export const savePages = async ({
  isUpdate,
  pagesJson,
  packId,
}: SavePagesParams) => {
  try {
    if (isUpdate) {
      await db.packPage.deleteMany({
        where: {
          packId: packId,
        },
      });
    }
    for (const page of pagesJson) {
      const createdPage = await db.packPage.create({
        data: {
          pageNumber: page.pageNumber,
          pack: {
            connect: {
              id: packId,
            },
          },
        },
      });
      const items: PackPageItem[] = page.items;
      for (const item of items) {
        if (item.headContent == null) {
          throw "Please provide head content for every pack page item";
        }
        const createdHeadContent = await db.packPageItemHeadContent.create({
          data: {
            value: item.headContent.value,
          },
        });
        const createdItem = await db.packPageItem.create({
          data: {
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
          },
        });
        if (item.bodyContent) {
          for (const bodyItem of item.bodyContent) {
            await db.packPageItemBodyContent.create({
              data: {
                value: bodyItem.value,
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
  } catch (error) {
    console.log(error);
    throw error;
  }
};

//TODO Add Function for validating pages
