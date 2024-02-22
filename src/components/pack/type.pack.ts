import { PackPage, Prisma } from "@prisma/client";
import { UserForResponse } from "../user/type.user";
import { CategoryForResponse } from "../category/type.category";
import { CommentForResponse } from "../comment/type.comment";

export type PackFromQuery = Prisma.PackGetPayload<{
  include: {
    User_bookmarkedByForPack: true;
    Read: {
      select: { progress: true };
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
    pagesNew: {
      select: {
        id: true;
        pageNumber: true;
        items: {
          select: {
            id: true;
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
  pagesNew?: PackPageForResponse[];
  comments?: CommentForResponse[];
  published: boolean;
};

export type PackPageContentForResponse = {
  id: number;
  value: string;
};

export type PackPageItemForResponse = {
  id: number;
  type: string;
  headContent: PackPageContentForResponse;
  bodyContent: PackPageContentForResponse[];
};

export type PackPageForResponse = {
  pageNumber: number;
};
