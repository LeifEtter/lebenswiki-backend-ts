import db from "../../database/database";
import { Block } from "@prisma/client";

/**
 * Gets all user id of users blocked by a user
 * @param userId - Id of user whose blocks should be returned
 * @returns All ids of users the user has blocked
 */
export const getBlocksAsIdList = async (userId: number) => {
  const blocks = await db.block.findMany({
    where: { blockerId: userId },
  });
  const blockedIds: number[] = blocks.map((block: Block) => block.blockedId);
  return blockedIds;
};
