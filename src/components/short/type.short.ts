import { Prisma } from "@prisma/client";
import { UserForResponse } from "../user/type.user";

export type ShortFromQuery = Prisma.ShortGetPayload<{
  include: {
    User_Short_creatorIdToUser: true;
    User_bookmarkedBy: true;
    User_downVote: true;
    User_upVote: true;
    User_clap: true;
  };
}>;

export type ShortForResponse = {
  id: number;
  title: string;
  content: string;
  creationDate: Date;
  claps: number;
  creator: UserForResponse;
  votes: number;
  bookmarks: number;
  userHasBookmarked: boolean;
  userHasClapped: boolean;
  totalClaps: number;
  published: boolean;
};
