import { PackPage, Prisma } from "@prisma/client";
import { UserForResponse } from "../user/type.user";
import { CategoryForResponse } from "../category/type.category";
import { CommentForResponse } from "../comment/type.comment";

export type PackFromQuery = Prisma.PackGetPayload<{
  include: {
    User_bookmarkedByForPack: true;
    Read: {
      select: { progress: true; userId: true };
    };
    User_Pack_creatorIdToUser: true;
    Comment: {
      include: {
        User_Comment_creatorIdToUser: true;
        User_commentDownVote: true;
        User_commentUpVote: true;
      };
    };
    Category: {
      select: {
        id: true;
        categoryName: true;
      };
    };
    pages: {
      select: {
        id: true;
        pageNumber: true;
        type: true;
        items: {
          select: {
            id: true;
            position: true;
            type: true;
            headContent: {
              select: {
                id: true;
                value: true;
              };
            };
            bodyContent: {
              select: {
                id: true;
                value: true;
                isCorrectAnswer: true;
              };
            };
          };
        };
      };
    };
    User_userClap: true;
  };
}>;

export type PackForResponse = {
  id: number;
  title: string;
  titleImage: string;
  description: string;
  initiative: string;
  readProgress: number;
  categories: CategoryForResponse[];
  creator: UserForResponse;
  creationDate: Date;
  readTime: number;
  userHasBookmarked: boolean;
  userHasClapped: boolean;
  totalBookmarks: number;
  totalClaps: number;
  pages: PackPageForResponse[];
  comments?: CommentForResponse[];
  published: boolean;
  totalReads?: number;
};

export type PackPageContentForResponse = {
  id: number;
  value: string;
  isCorrectAnswer?: boolean;
};

export type PackPageItemForResponse = {
  id: number;
  type: string;
  position: number;
  headContent: PackPageContentForResponse;
  bodyContent: PackPageContentForResponse[];
};

export type PackPageForResponse = {
  pageNumber: number;
  type: string;
};
