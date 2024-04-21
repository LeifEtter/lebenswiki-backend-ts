import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import multer = require("multer");
import { Middleware } from "express-validator/src/base";

const client = new S3Client({
  region: "eu-central-1",
});

/**
 * Generates a presigned url for an image in S3
 *
 * @param path - The place where the image is stored in S3
 * @returns A presigned url, pointing to an image in S3
 */
export const getSignedUrlForImageViewing = async (
  path: string
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: "lebenswiki-storage",
    Key: path,
  });
  const url = await getSignedUrl(client, command, { expiresIn: 7200 });
  return url;
};

/**
 * Checks if an Object exists in S3
 *
 * @param path - The place where the image is stored in S3
 * @returns True if the file exists at the given path, and false if not
 */
export const checkIfObjectExists = async (path: string): Promise<boolean> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: "lebenswiki-storage",
      Key: path,
    });
    return (await client.send(command)).$metadata.httpStatusCode == 200;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/**
 * Generates and returns a presigned url for a persons avatar
 *
 * @param userId - id of the person whose avatar is being retrieved
 * @returns A presigned url pointing to a users avatar
 */
export const getSignedUrlForAvatar = async (userId: number): Promise<string> =>
  await getSignedUrlForImageViewing(`profiles/${userId}/avatar.png`);

export const getSignedUrlForCover = async (packId: number): Promise<string> => {
  const objectExists: boolean = await checkIfObjectExists(
    `packs/${packId}/cover.png`
  );
  return objectExists
    ? await getSignedUrlForImageViewing(`packs/${packId}/cover.png`)
    : await getSignedUrlForImageViewing(`packs/placeholder_pack-title.png`);
};
// export const getSignedUrlForPack = async (packId: number): Promise<string> => {
//   const objectExists: boolean = await checkIfObjectExists(
//     `packs/${packId}/cover.png`,
//   );
//   return objectExists
//     ? await getSignedUrlForImageViewing(`packs/${packId}/cover.png`)
//     : await getSignedUrlForImageViewing(`packs/placeholder_pack-title.png`);
// };

export const uploadImageToS3 = async (
  path: string,
  blob: Buffer
): Promise<void> => {
  const command = new PutObjectCommand({
    Bucket: "lebenswiki-storage",
    Key: path,
    Body: blob,
  });
  try {
    const result = await client.send(command);
  } catch (error) {
    console.log("AWS Error while Uploading image: " + error);
    throw Error;
  }
};
/**
 * Deletes image from S3
 *
 * @param path Location of image in S3 Bucket
 */
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

/** Retrieves avatar image and uploads to S3 */
export const uploadAvatar: Middleware = async (req, res) => {
  try {
    const userId = res.locals.user.id;
    await uploadImageToS3(`profiles/${userId}/avatar.png`, req.file!.buffer);
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

/** Deletes Avatar from s3 */
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
