import db from "../../database/database";
import { Block } from "@prisma/client";

export const getBlocksAsIdList = async (userId: number) => {
  const blocks = await db.block.findMany({
    where: { blockerId: userId },
  });
  const blockedIds: number[] = blocks.map((block: Block) => block.blockedId);
  return blockedIds;
};
