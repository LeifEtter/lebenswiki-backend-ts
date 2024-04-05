import { Category } from "@prisma/client";
import { CategoryForResponse } from "./type.category";

export const convertCategoryForResponse = (
  category: Category,
): CategoryForResponse => ({
  id: category.id,
  name: category.categoryName,
});
