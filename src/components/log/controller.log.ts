import { Middleware } from "express-validator/src/base";
import db from "../../database/database";
import logger from "../../logging/logger";

/** Creates a log for an event */
export const catchLog: Middleware = async (req, res) => {
  try {
    const platform: string = req.body.platform;
    const deviceId: string = req.body.deviceId;
    const event: string | undefined = req.body.event;
    const stackTrace: string | undefined = req.body.stackTrace;
    await db.eventLog.create({
      data: {
        platform,
        deviceId,
        event,
        stackTrace,
      },
    });
    return res.status(201).send({ message: "Successfully logged event" });
  } catch (error) {
    logger.error(error);
    return res
      .status(404)
      .send({ message: "Something went wrong while logging" });
  }
};
