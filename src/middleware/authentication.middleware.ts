import { NextFunction, Request, Response } from "express";
import jwt = require("jsonwebtoken");
import db = require("../database/database");
import { GENERIC_AUTH_ERROR } from "../constants/errorMessages";

const extractTokenFromRequest = (req: Request) => {
  const bearer: string | undefined = req.headers.authorization;
  let token: string | undefined;
  if (bearer) {
    token = bearer.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt_token) {
    token = req.cookies.jwt_token;
  }
  return token;
};

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    const anonymousUser = await db.user.findUniqueOrThrow({
      where: {
        email: "anonymous@lebenswiki.com",
      },
      include: {
        role: true,
      },
    });
    res.locals.user = {
      id: anonymousUser.id,
      name: anonymousUser.name,
      role: {
        level: anonymousUser.role!.accessLevel,
        name: anonymousUser.role!.name,
      },
    };
    next();
  } else {
    try {
      const jwtBody: jwt.JwtPayload | string = jwt.verify(
        token,
        process.env.JWT_SECRET!,
      );
      if (typeof jwtBody == "string") {
        throw "Malformed Token, only a single string could be extracted";
      }
      if (jwtBody.user_id == null) {
        throw "Malformed token. Extracted Payload doesn't contain a user Id";
      }
      const user = await db.user.findFirst({
        where: { id: jwtBody.user_id },
        include: {
          role: true,
        },
      });
      if (!user) {
        return res.status(401).send({ message: GENERIC_AUTH_ERROR });
      } else {
        res.locals.user = {
          id: user.id,
          name: user.name,
          role: {
            id: user.role!.id,
            level: user.role!.accessLevel,
            name: user.role!.name,
          },
        };
        next();
      }
    } catch (error) {
      console.log(error);
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).send({
          message:
            "Your token has expired, please login to receive a new token",
        });
      }
      return res.status(401).send({ message: GENERIC_AUTH_ERROR });
    }
  }
};

export default authenticate;
