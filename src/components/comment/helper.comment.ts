import { Prisma } from "@prisma/client";
import { CommentForResponse, Vote } from "./type.comment";
import { convertUserForResponse } from "../user/helpers.user";

export type CommentFromQuery = Prisma.CommentGetPayload<{
  include: {
    User_Comment_creatorIdToUser: true;
    User_commentDownVote: true;
    User_commentUpVote: true;
  };
}>;

type ConvertForResponseParams = {
  comment: CommentFromQuery;
  userId: number;
};

export const convertCommentForResponse = async ({
  comment,
  userId,
}: ConvertForResponseParams): Promise<CommentForResponse> => {
  const voteCount: number =
    comment.User_commentUpVote.length - comment.User_commentDownVote.length;
  let vote: number;
  if (comment.User_commentUpVote.filter((e) => e.id == userId)) {
    vote = Vote.UPVOTE;
  } else if (comment.User_commentDownVote.filter((e) => e.id == userId)) {
    vote = Vote.DOWNVOTE;
  } else {
    vote = Vote.NO_VOTE;
  }
  return {
    id: comment.id,
    content: comment.commentResponse,
    creationDate: comment.creationDate,
    usersVote: vote,
    voteCount: voteCount,
    creator: await convertUserForResponse(comment.User_Comment_creatorIdToUser),
  };
};
