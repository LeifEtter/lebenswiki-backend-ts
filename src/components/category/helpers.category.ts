import { Category } from "@prisma/client";
import { CategoryForResponse } from "./type.category";

/**
 * Prepares queried category for the frontend
 * @param category - Queried Category
 * @returns Category Object for frontend
 */
export const convertCategoryForResponse = (
  category: Category
): CategoryForResponse => ({
  id: category.id,
  name: category.categoryName,
});
