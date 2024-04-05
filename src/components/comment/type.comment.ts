import { UserForResponse } from "../user/type.user";

// TODO Add Reactions

export enum Vote {
  UPVOTE = 1,
  NO_VOTE = 0,
  DOWNVOTE = -1,
}

export type CommentForResponse = {
  id: number;
  content: string;
  creationDate: Date;
  usersVote: number;
  voteCount: number;
  creator: UserForResponse;
};
