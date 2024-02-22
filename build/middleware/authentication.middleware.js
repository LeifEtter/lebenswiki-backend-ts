"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const db = require("../database/database");
const errorMessages_1 = require("../constants/errorMessages");
const extractTokenFromRequest = (req) => {
    const bearer = req.headers.authorization;
    let token;
    if (bearer) {
        token = bearer.split(" ")[1];
    }
    else if (req.cookies && req.cookies.jwt_token) {
        token = req.cookies.jwt_token;
    }
    return token;
};
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = extractTokenFromRequest(req);
    if (!token) {
        const anonymousUser = yield db.user.findUniqueOrThrow({
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
                level: anonymousUser.role.accessLevel,
                name: anonymousUser.role.name,
            },
        };
        next();
    }
    else {
        try {
            const jwtBody = jwt.verify(token, process.env.JWT_SECRET);
            if (typeof jwtBody == "string") {
                throw "Malformed Token, only a single string could be extracted";
            }
            if (jwtBody.user_id == null) {
                throw "Malformed token. Extracted Payload doesn't contain a user Id";
            }
            const user = yield db.user.findFirst({
                where: { id: jwtBody.user_id },
                include: {
                    role: true,
                },
            });
            if (!user) {
                return res.status(401).send({ message: errorMessages_1.GENERIC_AUTH_ERROR });
            }
            else {
                res.locals.user = {
                    id: user.id,
                    name: user.name,
                    role: {
                        id: user.role.id,
                        level: user.role.accessLevel,
                        name: user.role.name,
                    },
                };
                next();
            }
        }
        catch (error) {
            console.log(error);
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).send({
                    message: "Your token has expired, please login to receive a new token",
                });
            }
            return res.status(401).send({ message: errorMessages_1.GENERIC_AUTH_ERROR });
        }
    }
});
exports.default = authenticate;
