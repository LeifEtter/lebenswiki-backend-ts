import { Prisma, User } from "@prisma/client";
import { PackForResponse, PackFromQuery } from "./type.pack";
import { CategoryForResponse } from "../category/type.category";
import db from "../../database/database";
import { convertUserForResponse } from "../user/helpers.user";
import { convertCategoryForResponse } from "../category/helpers.category";
import { UserForResponse } from "../user/type.user";
import { convertCommentForResponse } from "../comment/helper.comment";
import { CommentForResponse } from "../comment/type.comment";
import {
  getSignedUrlForCover,
  getSignedUrlForImageViewing,
} from "../image/controller.image";

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
  const usersRead = pack.Read.filter((read) => read.userId == userId);
  const readProgress: number = usersRead.length > 0 ? usersRead[0].progress : 0;
  const totalReads: number = pack.Read.length;
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
  const titleImage: string = await getSignedUrlForCover(pack.id);
  for (const page of pack.pages) {
    for (const item of page.items) {
      if (item.type == "ItemType.image") {
        item.headContent!.value = await getSignedUrlForImageViewing(
          `packs/${pack.id}/pages/${item.id}.png`,
        );
      }
    }
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
    titleImage,
    comments: comments.length != 0 ? comments : undefined,
    pages: pack.pages,
    published: pack.published,
    totalReads,
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
          // where: { userId: userId },
          select: { progress: true, userId: true },
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
        pages: {
          select: {
            id: true,
            pageNumber: true,
            items: {
              select: {
                position: true,
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
