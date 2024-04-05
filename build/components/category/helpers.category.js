"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCategoryForResponse = void 0;
const convertCategoryForResponse = (category) => ({
    id: category.id,
    name: category.categoryName,
});
exports.convertCategoryForResponse = convertCategoryForResponse;
