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
exports.convertUserForResponse = void 0;
const controller_image_1 = require("../image/controller.image");
const database_1 = __importDefault(require("../../database/database"));
const convertUserForResponse = (user) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let profileImage;
    if (user.avatar == null) {
        profileImage = yield (0, controller_image_1.getSignedUrlForAvatar)(user.id);
    }
    const role = yield database_1.default.role.findUniqueOrThrow({ where: { id: user.roleId } });
    return {
        id: user.id,
        name: user.name,
        biography: user.biography,
        avatar: (_a = user.avatar) !== null && _a !== void 0 ? _a : undefined,
        profileImage: profileImage,
        isFirstLogin: user.isFirstLogin,
        role: {
            id: role.id,
            level: role.accessLevel,
            name: role.name,
        },
    };
});
exports.convertUserForResponse = convertUserForResponse;
