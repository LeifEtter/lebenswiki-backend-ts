import { User } from "@prisma/client";
import dotenv = require("dotenv");
dotenv.config();
import { NextFunction, Request, Response } from "express";
import jwt = require("jsonwebtoken");
import db from "../database/database";

const authenticateAndSaveUser = async (res: Response, next: NextFunction) => {
  try {
    if (res.locals.token == null) {
      console.log("No token found in request");
      return res
        .status(401)
        .send({ message: "Please provide a Token to access this route" });
    }
    let userId: number;
    try {
      const jwtBody: jwt.JwtPayload | string = jwt.verify(
        res.locals.token,
        process.env.JWT_SECRET!
      );
      if (typeof jwtBody == "string") {
        throw "Malformed Token";
      }
      userId = jwtBody.userId;
    } catch (error) {
      console.log(error);
      return res.status(401).send({
        message:
          "Couldn't verify token. Please make sure your token hasn't expired.",
      });
    }
    const user: User | null = await db.user.findFirst();
    if (!user) {
      return res.status(401).send({ message: GENERIC_AUTH_ERROR });
    }
    res.locals.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).send({ message: GENERIC_AUTH_ERROR });
  }
};

export = authenticateAndSaveUser;
