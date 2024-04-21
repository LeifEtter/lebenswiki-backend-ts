import bcrypt = require("bcrypt");
import { User } from "@prisma/client";
import jwt = require("jsonwebtoken");
import _ from "lodash";
import {
  GENERIC_LOGIN_ERROR,
  GENERIC_REGISTRATION_ERROR,
} from "../../constants/errorMessages";
import { handleError } from "../error/helper.error";
import { Middleware } from "express-validator/src/base";
import db = require("../../database/database");
import { getPacksForReturn } from "../pack/helpers.pack";
import { getBlocksAsIdList } from "../block/helpers.block";
import { PackForResponse } from "../pack/type.pack";
import { convertUserForResponse } from "./helpers.user";
import { UserForResponse } from "./type.user";
import { getSignedUrlForAvatar } from "../image/controller.image";

const SALT_ROUNDS: number = 10;
const TWO_HOURS_IN_MILLISECONDS = 2 * 60 * 60 * 1000;
const THIRTY_DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

/** Checks if a token passed in the headers or cookies is valid */
export const checkToken: Middleware = async (req, res) => {
  try {
    const user = await db.user.findUniqueOrThrow({
      where: {
        id: res.locals.user.id,
      },
    });
    const userForResponse: UserForResponse = await convertUserForResponse(user);
    return res.status(200).send(userForResponse);
  } catch (error) {
    return handleError({ error, res, rName: "User" });
  }
};

/** Creates a user account */
export const register: Middleware = async (req, res) => {
  try {
    const { email, password, name, biography } = req.body;
    if ((await db.user.findUnique({ where: { email } })) != null) {
      return res.status(400).send({
        id: 117,
        message: "User with this email address already exists",
      });
    }
    const encryptedPassword: string = await bcrypt.hash(password, SALT_ROUNDS);
    const user: User | null = await db.user.create({
      data: {
        name: name,
        email: email,
        password: encryptedPassword,
        biography: biography,
        role: {
          connect: { id: 2 },
        },
      },
    });
    return res.status(201).send({ message: "Registration was successful" });
  } catch (error) {
    return handleError({
      res,
      error,
      rName: "User",
      message: GENERIC_REGISTRATION_ERROR,
    });
  }
};

/** Returns a jwt token if user successfully logs in */
export const login: Middleware = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Prevent anon login
    if (email == "anonymous@lebenswiki.com") {
      return res.status(401).send({
        message: "I'm sorry, but this email can't be used to log in.",
      });
    }
    const user = await db.user.findUnique({ where: { email: email } });
    if (!user) {
      console.log("User not found");
      return res.status(404).send({ message: GENERIC_LOGIN_ERROR });
    }
    // Prevent anon login
    if (user.id == 0) {
      return res
        .status(401)
        .send({ message: "A token cant be issued for this account." });
    }
    const passwordValid: boolean = await bcrypt.compare(
      password,
      user.password
    );
    if (!passwordValid) {
      return res.status(404).send({ message: GENERIC_LOGIN_ERROR });
    }
    //TODO change expires in
    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "30 days",
    });
    const isFirstLogin: boolean = user.isFirstLogin;
    if (isFirstLogin) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          isFirstLogin: false,
        },
      });
    }

    res.status(200);
    //TODO Figure out how to reduce token alive time
    res.cookie("jwt_token", token, {
      secure: process.env.ENV! !== "DEVELOPMENT",
      httpOnly: true,
      maxAge: THIRTY_DAYS_IN_MILLISECONDS,
    });
    return res.send(await convertUserForResponse(user));
  } catch (error) {
    console.log(error);
    return res
      .status(501)
      .send({ message: "Login Failed, please try again later" });
  }
};

/** Updates a users password if they pass a valid old password */
export const updatePassword: Middleware = async (req, res) => {
  try {
    const { password, oldPassword } = req.body;
    if (!oldPassword) {
      return res.status(401).send({
        message:
          "Please supply your old password in order to reset your password.",
      });
    }
    const existingUser = await db.user.findUniqueOrThrow({
      where: { id: res.locals.user.id },
    });
    const passwordsMatch: boolean = await bcrypt.compare(
      oldPassword,
      existingUser?.password
    );
    if (!passwordsMatch) {
      return res
        .status(401)
        .send({ message: "Old password supplied doesn't match" });
    }
    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await db.user.update({
      where: { id: res.locals.user.id },
      data: { password: encryptedPassword },
    });
    return res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    return handleError({ res, error, rName: "User" });
  }
};

/** Update Information of a user profile */
export const updateProfile: Middleware = async (req, res) => {
  try {
    const { name, biography, avatar } = req.body;
    await db.user.update({
      where: {
        id: res.locals.user.id,
      },
      data: {
        name,
        biography,
        avatar,
      },
    });
    return res.status(200).send({ message: "Profile Updated" });
  } catch (error) {
    return handleError({ error, res, rName: "User" });
  }
};

/** Returns a users own profile data as well as a presigned image url for their avatar */
export const showProfile: Middleware = async (req, res) => {
  try {
    const user = await db.user.findUniqueOrThrow({
      where: {
        id: res.locals.user.id,
      },
    });

    let profileImage: string | undefined;
    if (user.avatar == null) {
      profileImage = await getSignedUrlForAvatar(user.id);
    }

    const role = await db.role.findUniqueOrThrow({
      where: { id: user.roleId! },
    });
    const userForResponse = {
      id: user.id,
      name: user.name,
      biography: user.biography,
      avatar: user.avatar ?? undefined,
      profileImage: profileImage,
      email: user.email,
      role: {
        id: role.id,
        level: role.accessLevel,
        name: role.name,
      },
    };
    return res.status(200).send(userForResponse);
  } catch (error) {
    console.log(error);
    return res.status(501).send({
      message: "Something went wrong while trying to retrieve your account",
    });
  }
};
/** Deletes a users own account */
export const deleteUser: Middleware = async (req, res) => {
  try {
    await db.user.delete({ where: { id: res.locals.user.id } });
    return res.status(200).send({
      message:
        "Your User Account as well as all your personal information has been removed. This includes your Shorts, Packs, Up- and Downvotes, Comments, and Bookmarks. Any personal information stored in Reports you may have made was removed. To remove the rest of your information such as tracked actions used for statistical purposes, please contact us at: lebenswiki@gmail.com",
    });
  } catch (error) {
    handleError({
      res,
      error,
      rName: "User",

      message:
        "Something went wrong while trying to delete your account, please contact us immediately.",
    });
  }
};

/** Retrieves an other users profile, if they haven't blocked them or were blocked by them */
export const getUsersProfile: Middleware = async (req, res) => {
  try {
    if ((await getBlocksAsIdList(res.locals.user.id)).includes(res.locals.id)) {
      return res.status(400).send({
        message: "You can't view a profile of a user you have blocked",
      });
    }
    const user = await db.user.findUniqueOrThrow({
      where: {
        id: res.locals.id,
      },
      include: {
        role: true,
      },
    });
    const packs: PackForResponse[] = await getPacksForReturn({
      where: { creatorId: res.locals.user.id, published: true },
      userId: res.locals.user.id,
      blockList: await getBlocksAsIdList(res.locals.user.id),
    });
    return res.status(200).send({
      id: user.id,
      name: user.name,
      biography: user.biography,
      role: {
        id: user.role!.id,
        name: user.role!.name,
        level: user.role!.accessLevel,
      },
      packs: packs,
    });
  } catch (error) {
    return handleError({ error, res, rName: "User" });
  }
};

/** Sets a bear avatar for a user */
export const defaultAvatar: Middleware = async (req, res) => {
  try {
    await db.user.update({
      where: { id: res.locals.user.id },
      data: { avatar: "assets/avatars/001-bear.png" },
    });
    return res.status(200).send({ message: "Default avatar set" });
  } catch (error) {
    return res.status(501).send({ message: "Something went wrong" });
  }
};

/** Lets requester block another user */
export const blockUser: Middleware = async (req, res) => {
  try {
    const userToBlock = await db.user.findUnique({
      where: {
        id: res.locals.id,
      },
      include: {
        Block_Block_blockerIdToUser: true,
      },
    });
    if (!userToBlock) {
      return res.status(404).send({ message: "User couldn't be found" });
    }
    if (userToBlock.Block_Block_blockerIdToUser.includes(res.locals.user.id)) {
      return res.status(400).send({ message: "User already blocked" });
    }
    await db.block.create({
      data: {
        User_Block_blockerIdToUser: {
          connect: {
            id: res.locals.user.id,
          },
        },
        User_Block_blockedIdToUser: {
          connect: {
            id: res.locals.id,
          },
        },
        reason: req.body.reason,
      },
    });
    return res.status(201).send({ message: "User has been blocked" });
  } catch (error) {
    console.log(error);
    return res.status(501).send({
      message:
        "Something went wrong while blocking this user. Please contact us immediately.",
    });
  }
};
/** Lets requester unblock another user */
export const unblockUser: Middleware = async (req, res) => {
  try {
    const userToBlock = await db.user.findUnique({
      where: {
        id: res.locals.id,
      },
    });
    console.log(userToBlock);
    if (!userToBlock) {
      return res.status(404).send({ message: "User couldn't be found" });
    }
    console.log(res.locals.user.id);
    console.log(res.locals.id);
    await db.block.deleteMany({
      where: {
        blockerId: res.locals.user.id,
        blockedId: res.locals.id,
      },
    });
    return res.status(200).send({ message: "User has been unblocked" });
  } catch (error) {
    console.log(error);
    return res.status(501).send({
      message:
        "Something went wrong while unblocking this user. Please contact us immediately.",
    });
  }
};
