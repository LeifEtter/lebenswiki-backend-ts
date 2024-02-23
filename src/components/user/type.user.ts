import { PackForResponse } from "../pack/type.pack";
import { ShortForResponse } from "../short/type.short";

export type RoleForResponse = {
  id: number;
  name: string;
  level: number;
};

export type UserForResponse = {
  id: number;
  name: string;
  avatar?: string;
  profileImage?: string;
  role: RoleForResponse;
  biography: string;
  packs?: PackForResponse[];
  shorts?: ShortForResponse[];
  bookmarkedPacks?: PackForResponse[];
  bookmarkedShorts?: ShortForResponse[];
  isFirstLogin?: boolean;
};
