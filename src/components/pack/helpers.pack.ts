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
import logger from "../../logging/logger";

/**
 * Checks if a user has bookmarked a specific pack
 *
 * @param userId - Id of user checking if they have bookmarked a pack
 * @param bookmarks - List containing users that bookmarked the pack
 * @returns True if user has bookmarked the pack, False if not
 */
const checkIfUserHasBookmarked = (userId: number, bookmarks: User[]) => {
  const bookmarkMadeByUser = bookmarks.filter((user) => user.id == userId);
  if (bookmarkMadeByUser.length > 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * Checks if a user has clapped for a pack
 *
 * @param userId - Id of user checking if they have clapped for a pack
 * @param bookmarks - List containing users that clapped for pack
 * @returns True if user has clapped for the pack, False if not
 */
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

//TODO improve function, Improve Documentation
/**
 * Converts a pack for the frontend
 *
 * @param userId - user requesting the pack
 * @param pack - the requested pack
 * @param includeComments - if comments should be included
 * @param includePages - if pages should be included
 * @returns Pack for the Frontend
 */
export const convertPackForResponse = async ({
  userId,
  pack,
  includeComments,
  includePages,
}: ConvertPackForResponseParams): Promise<PackForResponse> => {
  const userHasBookmarked: boolean = checkIfUserHasBookmarked(
    userId,
    pack.User_bookmarkedByForPack
  );
  const userHasClapped: boolean = checkIfUserHasClapped(
    userId,
    pack.User_userClap
  );
  const totalClaps: number = pack.User_userClap.length;
  const totalBookmarks: number = pack.User_bookmarkedByForPack.length;
  const usersRead = pack.Read.filter((read) => read.userId == userId);
  const readProgress: number = usersRead.length > 0 ? usersRead[0].progress : 0;
  const totalReads: number = pack.Read.length;
  const creator: UserForResponse = await convertUserForResponse(
    pack.User_Pack_creatorIdToUser!
  );
  const categories: CategoryForResponse[] = pack.Category.map((cat) =>
    convertCategoryForResponse(cat)
  );
  let comments: CommentForResponse[] = [];
  if (includeComments) {
    comments = await Promise.all(
      pack.Comment.map(
        async (comment) => await convertCommentForResponse({ comment, userId })
      )
    );
  }
  const titleImage: string = await getSignedUrlForCover(pack.id);
  for (const page of pack.pages) {
    for (const item of page.items) {
      if (item.type == "ItemType.image") {
        item.headContent!.value = await getSignedUrlForImageViewing(
          `packs/${pack.id}/pages/${item.id}.png`
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
  take?: number;
  skip?: number;
};

/**
 * Retrieves pack from the db and converts them for response to frontend
 *
 * @param where - original query
 * @param userId - userId of user requesting the packs
 * @param blockList - userId's of users the requester has blocked
 * @param includeComments - wether to include the packs comments
 * @param includePages - whether to include the packs pages
 * @returns
 */
export const getPacksForReturn = async ({
  where,
  userId,
  blockList,
  includeComments,
  includePages,
  take,
  skip,
}: GetPacksForReturnParams): Promise<PackForResponse[]> => {
  try {
    const packs: PackFromQuery[] = await db.pack.findMany({
      take: take,
      skip: skip,
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
            type: true,
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
                    isCorrectAnswer: true,
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
          })
      )
    );
    return packsForResponse;
  } catch (error) {
    logger.error("Error while trying to retrieve packs for return" + error);
    throw error;
  }
};
