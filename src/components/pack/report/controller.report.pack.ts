import db from "../../../database/database";
import { handleError } from "../../error/helper.error";
import { Middleware } from "express-validator/src/base";

/** Reports a pack, given a reason */
export const reportPack: Middleware = async (req, res) => {
  try {
    const report = await db.report.create({
      data: {
        reason: req.body.reason,
        Pack: {
          connect: {
            id: res.locals.id,
          },
        },
      },
    });
    return res.status(201).send({
      message: "Report successfully handed in",
      reportId: report.id,
    });
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};

/** Retrieves all pack reports */
export const getPackReports: Middleware = async (req, res) => {
  try {
    const reports = await db.report.findMany({
      where: {
        Pack: { isNot: null },
      },
      include: {
        Pack: true,
      },
    });
    return res.status(200).send({ reports });
  } catch (error) {
    return handleError({ res, error, rName: "Pack" });
  }
};
