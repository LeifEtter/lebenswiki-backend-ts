import { Prisma } from "@prisma/client";
import { convertUserForResponse } from "../user/helpers.user";
import { UserForResponse } from "../user/type.user";
import { ShortFromQuery, ShortForResponse } from "./type.short";
import db from "../../database/database";

type GetShortsForResponseType = {
  where: Prisma.ShortWhereInput;
  userId: number;
  blockList: number[];
};

/**
 * Assists in querying shorts
 *
 * @param where Contains the original query clause
 * @param userId Contains the requesters user id
 * @returns A List containing all the shorts ready for the frontend
 */
export const getShortsForResponse = async ({
  where,
  userId,
}: GetShortsForResponseType): Promise<ShortForResponse[]> => {
  const shorts = await db.short.findMany({
    where,
    include: {
      User_Short_creatorIdToUser: true,
      User_bookmarkedBy: true,
      User_downVote: true,
      User_upVote: true,
      User_clap: true,
    },
  });
  const shortsForResponse: ShortForResponse[] = await Promise.all(
    shorts.map(async (short) => await convertShortForResponse(userId, short))
  );
  return shortsForResponse;
};

/**
 * Assists in preparing a short for the frontend
 *
 * @param userId Contains the requesters user id
 * @param short Contains a single queried short
 * @returns Short ready for the frontend
 */
export const convertShortForResponse = async (
  userId: number,
  short: ShortFromQuery
): Promise<ShortForResponse> => {
  const bookmarkCount: number = short.User_bookmarkedBy.length;
  const votes: number = short.User_upVote.length - short.User_downVote.length;
  const creator: UserForResponse = await convertUserForResponse(
    short.User_Short_creatorIdToUser
  );
  const totalClaps: number = short.User_clap.length;
  const userHasClapped =
    short.User_clap.filter((user) => user.id == userId).length > 0;
  const userHasBookmarked =
    short.User_bookmarkedBy.filter((user) => user.id == userId).length > 0;
  return {
    id: short.id,
    title: short.title,
    content: short.content,
    bookmarks: bookmarkCount,
    userHasBookmarked,
    totalClaps,
    userHasClapped,
    votes,
    creator,
    creationDate: short.creationDate,
    claps: 0,
    published: short.published,
  };
};
