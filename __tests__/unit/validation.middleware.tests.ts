import {
  checkValidId,
  checkValidatorResult,
} from "../../src/middleware/validation.middleware";
import { NextFunction, Request, Response } from "express";

describe("Validation middleware functions", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  describe("id validator middleware", () => {
    it("should return require id message when not passing any id", async () => {
      checkValidId(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        id: 110,
        message:
          "This route requires passing an ID, to define which resource to perform the action on",
      });
    });

    it("should return invalid id when string is passed", async () => {
      mockRequest.params = { id: "notAnInt" };
      checkValidId(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith({
        id: 110,
        message: "The ID passed must be a number",
      });
    });
  });

  //   describe("check validator result middleware", () => {
  //     const validatorMiddleware = checkValidatorResult({
  //       resource: "something",
  //       msg: "something",
  //     });

  //     it("should respond with bad email format", () => {
  //         validatorMiddleware()
  //     });
  //     validatorMiddleware()
  //   });
});
