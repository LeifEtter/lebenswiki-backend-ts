"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlocksAsIdList = void 0;
const database_1 = __importDefault(require("../../database/database"));
const filterBlockedPacks = ({ userId, packs, }) => {
    const BlockedUsers = database_1.default.user.findUnique({
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
const getBlocksAsIdList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const blocks = yield database_1.default.block.findMany({
        where: { blockerId: userId },
    });
    const blockedIds = blocks.map((block) => block.blockedId);
    return blockedIds;
});
exports.getBlocksAsIdList = getBlocksAsIdList;
