import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import multer = require("multer");
import { Middleware } from "express-validator/src/base";
const upload = multer();

const client = new S3Client({
  region: "eu-central-1",
});

export const getSignedUrlForImageViewing = async (
  path: string,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: "lebenswiki-storage",
    Key: path,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 3600 });
  return url;
};

export const getSignedUrlForAvatar = async (userId: number): Promise<string> =>
  await getSignedUrlForImageViewing(`/profiles/${userId}/avatar`);

const uploadImageToS3 = async (path: string, blob: Buffer): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: "lebenswiki-storage",
    Key: path,
    Body: blob,
  });
  try {
    await client.send(command);
  } catch (error) {
    console.log("AWS Error while Uploading image: " + error);
    throw Error;
  }
};

const deleteImageFromS3 = async (path: string) => {
  const command = new DeleteObjectCommand({
    Bucket: "lebenswiki-storage",
    Key: path,
  });
  try {
    await client.send(command);
  } catch (error) {
    console.log("Error deleting image: " + error);
    throw error;
  }
};

export const uploadAvatar: Middleware = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    await uploadImageToS3(`/profiles/${userId}/avatar.png`, req.file!.buffer);
    const url = await getSignedUrlForAvatar(userId);
    return res
      .status(201)
      .send({ message: "Profile Image Update was successful", url: url });
  } catch (error) {
    console.log(error);
    return res
      .status(501)
      .send({ message: "Profile Image Couldn't be updated" });
  }
};

export const deleteAvatar: Middleware = async (req, res) => {
  try {
    const userId: number = res.locals.user.id;
    deleteImageFromS3(`/profiles/${userId}/avatar`);
    return res
      .status(200)
      .send({ message: "Profile Image was deleted successfully" });
  } catch (error) {
    console.log(error);
    return res
      .status(501)
      .send({ message: "Profile Image Couldn't be deleted" });
  }
};

// TODO Return user profile image upon retrieval of user object for viewing of pack
