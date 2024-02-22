import { PackForResponse } from "../pack/type.pack";
import { ShortForResponse } from "../short/type.short";

export type CategoryForResponse = {
  id: number;
  name?: string;
  packs?: PackForResponse[];
  shorts?: ShortForResponse[];
};
