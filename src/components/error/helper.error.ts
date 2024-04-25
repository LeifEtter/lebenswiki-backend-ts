import { Prisma } from "@prisma/client";
import { Response } from "express";
import logger from "../../logging/logger";

interface PrismaErrorHandlerType {
  res: Response;
  rName: string;
  error: unknown;
  message?: string;
}

/**
 * Handles Errors that occur in the controllers, and returns the appropriate message
 * @param res - Response object
 * @param rName - Name of the resource being requested
 * @param error - Error object that was thrown
 * @returns Response object with the appropriate status and error message and id
 */
export const handleError = ({
  res,
  rName,
  error,
}: PrismaErrorHandlerType): Response => {
  logger.error(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Resource not found
    if (["P2001", "P2025"].includes(error.code)) {
      return res
        .status(404)
        .send({
          id: 9,
          message: `No ${rName} found or you aren't the owner of the Pack and are performing an action that requires you to be, or you are trying to perform an illegal action on an unpublished resource.`,
        })
        .end();
    } else if (error.code == "P2002") {
      return res
        .status(400)
        .send({
          id: 9,
          message:
            "The Record already exists, or a Record with the same value for a parameter that needs to be unique already exists",
        })
        .end();
    } else {
      return res.status(501).send({
        id: 9,
        message:
          "Something went wrong retrieving the resource from the database. Please try again later.",
      });
    }
  } else {
    return res
      .status(501)
      .send({ id: 9, message: "An unimplemented Server Error has occurred" });
  }
};
