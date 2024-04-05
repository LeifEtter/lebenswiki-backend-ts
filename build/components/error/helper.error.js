"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const client_1 = require("@prisma/client");
const handleError = ({ res, rName, error, }) => {
    console.log(error);
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Resource not found
        if (["P2001", "P2025"].includes(error.code)) {
            return res
                .status(404)
                .send({
                id: 9,
                message: `No ${rName} found or you aren't the owner of the Pack and are performing an action that requires you to be, or you are trying to perform an illegal action on an unpublished resource.`,
            })
                .end();
        }
        else if (error.code == "P2002") {
            return res
                .status(400)
                .send({
                id: 9,
                message: "The Record already exists, or a Record with the same value for a parameter that needs to be unique already exists",
            })
                .end();
        }
        else {
            return res.status(501).send({
                id: 9,
                message: "Something went wrong retrieving the resource from the database. Please try again later.",
            });
        }
    }
    else {
        return res
            .status(501)
            .send({ id: 9, message: "An unimplemented Server Error has occurred" });
    }
};
exports.handleError = handleError;
