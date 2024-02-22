import { User } from "@prisma/client";
import { UserForResponse } from "./type.user";
import { getSignedUrlForAvatar } from "../image/controller.image";
import db from "../../database/database";

export const convertUserForResponse = async (
  user: User,
): Promise<UserForResponse> => {
  const profileImage = await getSignedUrlForAvatar(user.id);
  const role = await db.role.findUniqueOrThrow({ where: { id: user.roleId! } });
  return {
    id: user.id,
    name: user.name,
    biography: user.biography,
    avatar: profileImage,
    isFirstLogin: user.isFirstLogin,
    role: {
      id: role.id,
      level: role.accessLevel,
      name: role.name,
    },
  };
};
