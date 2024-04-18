import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../components/error/model.error";

interface checkValidatorResultType {
  resource: string;
  msg: string;
}

export const checkValidatorResult =
  ({ resource, msg }: checkValidatorResultType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array();
    if (errors.length == 0) {
      next();
    } else {
      console.log("Validator Detected an Error");
      console.log(errors);
      for (const valError of errors) {
        if (valError.type == "field") {
          // USER VALIDATON
          if (valError.path == "email") {
            return res
              .status(400)
              .send({ id: 100, message: "Email has bad format" });
          }
          if (valError.path == "password") {
            return res
              .status(400)
              .send({ id: 101, message: "Password has bad format" });
          }
          if (valError.path == "name") {
            return res
              .status(400)
              .send({ id: 102, message: "Name bad format" });
          }
          if (valError.path == "biography") {
            return res
              .status(400)
              .send({ id: 111, message: "Biography has bad format" });
          }

          // USER VALIDATION END
          // PACK/SHORT/COMMENT VALIDATION
          if (valError.path == "title") {
            let apiError: ApiError | undefined;
            if (resource == "Short") {
              apiError = {
                id: 103,
                message: "Title of Short has a bad format",
              };
            }
            if (resource == "Pack") {
              apiError = { id: 105 };
            }
            return res.status(400).send(apiError ?? { id: 9 });
          }
          if (valError.path == "content") {
            return res.status(400).send({
              id: 104,
              message:
                "Content of short has to be between 10 and 500 characters",
            });
          }
          if (valError.path == "category") {
            return res.status(400).send({ id: 112 });
          }
          if (valError.path == "description") {
            return res.status(400).send({ id: 106 });
          }
          if (valError.path == "initiative") {
            return res.status(400).send({ id: 113 });
          }
          if (valError.path == "readTime") {
            return res.status(400).send({ id: 114 });
          }
          if (valError.path == "reason") {
            if (resource == "Block") {
              return res.status(400).send({ id: 115 });
            }
            if (resource == "Report") {
              return res.status(400).send({ id: 116 });
            }
          }
          if (valError.path == "progress") {
            return res
              .status(400)
              .send({ id: 9, message: "Progress identifier invalid" });
          }
        }
      }
      return res.status(400).send({ id: 9, message: msg });
    }
  };

// if (validationResult(req).array().length != 0) {
//   return res.status(400).send({ message: "Please pass a valid id" });
// }

export const checkValidId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const numberRegex: RegExp = /^[0-9]+$/;
  if (!req.params.id) {
    return res.status(400).send({
      id: 110,
      message:
        "This route requires passing an ID, to define which resource to perform the action on",
    });
  }
  if (!req.params.id.match(numberRegex)) {
    return res
      .status(400)
      .send({ id: 110, message: "The ID passed must be a number" });
  } else {
    res.locals.id = parseInt(req.params.id);
    next();
  }
};

export const checkValidStringId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if (validationResult(req).array().length != 0) {
  //   return res.status(400).send({ message: "Please pass a valid id" });
  // }
  if (!req.params.id) {
    return res.status(400).send({
      id: 110,
      message:
        "This route requires passing an ID, to define which resource to perform the action on",
    });
  }
  res.locals.id = req.params.id;
  next();
};
