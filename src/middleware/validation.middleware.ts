import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

interface checkValidatorResultType {
  msg: string;
}

export const checkValidatorResult =
  ({ msg }: checkValidatorResultType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array();
    if (errors.length == 0) {
      next();
    } else {
      console.log("Validator Detected an Error");
      console.log(errors);
      return res.status(400).send({ message: msg });
    }
  };

export const checkValidId = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // if (validationResult(req).array().length != 0) {
  //   return res.status(400).send({ message: "Please pass a valid id" });
  // }
  const numberRegex: RegExp = /^[0-9]+$/;
  if (!req.params.id) {
    return res.status(400).send({
      message:
        "This route requires passing an ID, to define which resource to perform the action on",
    });
  }
  if (!req.params.id.match(numberRegex)) {
    return res.status(400).send({ message: "The ID passed must be a number" });
  } else {
    res.locals.id = parseInt(req.params.id);
    next();
  }
};
