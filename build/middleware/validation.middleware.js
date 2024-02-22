"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValidId = exports.checkValidatorResult = void 0;
const express_validator_1 = require("express-validator");
const checkValidatorResult = ({ msg }) => (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req).array();
    if (errors.length == 0) {
        next();
    }
    else {
        console.log("Validator Detected an Error");
        console.log(errors);
        return res.status(400).send({ message: msg });
    }
};
exports.checkValidatorResult = checkValidatorResult;
const checkValidId = (req, res, next) => {
    // if (validationResult(req).array().length != 0) {
    //   return res.status(400).send({ message: "Please pass a valid id" });
    // }
    const numberRegex = /^[0-9]+$/;
    if (!req.params.id) {
        return res.status(400).send({
            message: "This route requires passing an ID, to define which resource to perform the action on",
        });
    }
    if (!req.params.id.match(numberRegex)) {
        return res.status(400).send({ message: "The ID passed must be a number" });
    }
    else {
        res.locals.id = parseInt(req.params.id);
        next();
    }
};
exports.checkValidId = checkValidId;
