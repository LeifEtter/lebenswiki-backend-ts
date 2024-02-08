/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request, Response, NextFunction } from "express";

const appendTokenToRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
  tokenRequired: boolean
): Promise<void> => {
  const bearer: string | undefined = req.headers.authorization;
  let token: string | undefined;
  if (bearer) {
    token = bearer.split(" ")[1];
  } else if (req.cookies && req.cookies.jwt_token) {
    token = req.cookies.jwt_token;
  }
  if (tokenRequired && typeof token == "undefined") {
    res
      .status(401)
      .send({ message: "Please provide a Token to access this route" });
  } else {
    res.locals.token = token;
    next();
  }
};

export = appendTokenToRequest;
