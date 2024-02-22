import db from "../../database/database";
import { Block, Pack, User } from "@prisma/client";

interface FilterBlockedPacksType {
  userId: number;
  packs: [Pack];
}

const filterBlockedPacks = ({
  userId,
  packs,
}: FilterBlockedPacksType): [Pack] => {
  const BlockedUsers = db.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      Block_Block_blockerIdToUser: {
        select: {
          id: true,
        },
      },
    },
  });
  console.log(BlockedUsers);
  return packs;
};

export const getBlocksAsIdList = async (userId: number) => {
  const blocks = await db.block.findMany({
    where: { blockerId: userId },
  });
  const blockedIds: number[] = blocks.map((block: Block) => block.blockedId);
  return blockedIds;
};
