import bcrypt = require("bcrypt");
import { User } from "@prisma/client";
import jwt = require("jsonwebtoken");
import _ from "lodash";
import {
  GENERIC_LOGIN_ERROR,
  GENERIC_REGISTRATION_ERROR,
} from "../../constants/errorMessages";
import { getSignedUrlForAvatar } from "../image/controller.image";
import { handleError } from "../error/helper.error";
import { Middleware } from "express-validator/src/base";
import db = require("../../database/database");
import { getPacksForReturn } from "../pack/helpers.pack";
import { getBlocksAsIdList } from "../block/helpers.block";
import { PackForResponse } from "../pack/type.pack";
import { convertUserForResponse } from "./helpers.user";
import { UserForResponse } from "./type.user";

const SALT_ROUNDS: number = 10;
const TWO_HOURS_IN_MILLISECONDS = 2 * 60 * 60 * 1000;
const THIRTY_DAYS_IN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;

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
    return handleError({ error, res, rName: "User", rId: res.locals.user.id });
  }
};

export const register: Middleware = async (req, res) => {
  try {
    const { email, password, name, biography } = req.body;
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
      rId: res.locals.user.id,
      message: GENERIC_REGISTRATION_ERROR,
    });
  }
};

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
      user.password,
    );
    if (!passwordValid) {
      return res.status(404).send({ message: GENERIC_LOGIN_ERROR });
    }

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "30 days",
    });
    const isFirstLogin: boolean = user.isFirstLogin;
    if (isFirstLogin) {
      // await db.user.update({
      //   where: {
      //     id: user.id,
      //   },
      //   data: {
      //     isFirstLogin: false,
      //   },
      // });
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

export const updateProfile: Middleware = async (req, res) => {
  try {
    const { name, password, biography, oldPassword } = req.body;
    //TODO temporarily allow password change for admins
    if (password && res.locals.user.role.level < 10) {
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
        existingUser?.password,
      );
      if (!passwordsMatch) {
        return res
          .status(401)
          .send({ message: "Old password supplied doesn't match" });
      }
    }
    const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await db.user.update({
      where: {
        id: res.locals.user.id,
      },
      data: {
        name,
        password: encryptedPassword,
        biography,
      },
    });
    return res.status(200).send({ message: "Profile Updated" });
  } catch (error) {
    return handleError({ error, res, rName: "User", rId: 0 });
  }
};

export const showProfile: Middleware = async (req, res) => {
  try {
    const user = await db.user.findUniqueOrThrow({
      where: {
        id: res.locals.user.id,
      },
    });
    const userForResponse = await convertUserForResponse(user);
    userForResponse.avatar = await getSignedUrlForAvatar(user.id);
    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    return res.status(501).send({
      message: "Something went wrong while trying to retrieve your account",
    });
  }
};
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
      rId: res.locals.user.id,
      message:
        "Something went wrong while trying to delete your account, please contact us immediately.",
    });
  }
};

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
      where: { creatorId: res.locals.id, published: true },
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
    return handleError({ error, res, rName: "User", rId: res.locals.id });
  }
};

// Implement Anonymous login
