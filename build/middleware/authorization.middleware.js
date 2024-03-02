"use strict";
const minLevel = (minAccessLevel) => (req, res, next) => {
    const userLevel = res.locals.user.role.level;
    if (userLevel >= minAccessLevel) {
        next();
    }
    else {
        if (userLevel == 1) {
            return res.status(401).send({
                message: "You need to create an account to access this route.",
            });
        }
        else {
            return res.status(401).send({
                message: `You are not allowed to access this route as Role = ${res.locals.user.role.name}`,
            });
        }
    }
};
module.exports = minLevel;
