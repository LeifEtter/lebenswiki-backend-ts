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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAvatar = exports.uploadAvatar = exports.getSignedUrlForAvatar = exports.getSignedUrlForImageViewing = void 0;
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const client_s3_1 = require("@aws-sdk/client-s3");
const multer = require("multer");
const upload = multer();
const client = new client_s3_1.S3Client({
    region: "eu-central-1",
});
const getSignedUrlForImageViewing = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: "lebenswiki-storage",
        Key: path,
    });
    const url = yield (0, s3_request_presigner_1.getSignedUrl)(client, command, { expiresIn: 3600 });
    return url;
});
exports.getSignedUrlForImageViewing = getSignedUrlForImageViewing;
const getSignedUrlForAvatar = (userId) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, exports.getSignedUrlForImageViewing)(`/profiles/${userId}/avatar`); });
exports.getSignedUrlForAvatar = getSignedUrlForAvatar;
const uploadImageToS3 = (path, blob) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: "lebenswiki-storage",
        Key: path,
        Body: blob,
    });
    try {
        yield client.send(command);
    }
    catch (error) {
        console.log("AWS Error while Uploading image: " + error);
        throw Error;
    }
});
const deleteImageFromS3 = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: "lebenswiki-storage",
        Key: path,
    });
    try {
        yield client.send(command);
    }
    catch (error) {
        console.log("Error deleting image: " + error);
        throw error;
    }
});
const uploadAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.user.id;
        yield uploadImageToS3(`/profiles/${userId}/avatar.png`, req.file.buffer);
        const url = yield (0, exports.getSignedUrlForAvatar)(userId);
        return res
            .status(201)
            .send({ message: "Profile Image Update was successful", url: url });
    }
    catch (error) {
        console.log(error);
        return res
            .status(501)
            .send({ message: "Profile Image Couldn't be updated" });
    }
});
exports.uploadAvatar = uploadAvatar;
const deleteAvatar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = res.locals.user.id;
        deleteImageFromS3(`/profiles/${userId}/avatar`);
        return res
            .status(200)
            .send({ message: "Profile Image was deleted successfully" });
    }
    catch (error) {
        console.log(error);
        return res
            .status(501)
            .send({ message: "Profile Image Couldn't be deleted" });
    }
});
exports.deleteAvatar = deleteAvatar;
// TODO Return user profile image upon retrieval of user object for viewing of pack
