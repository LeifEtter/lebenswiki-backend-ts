import { NextFunction, Request, Response } from "express";
import minLevel from "../../src/middleware/authorization.middleware";

describe("testing authorization middleware", () => {
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

  describe("given user level 1 (anonymous login)", () => {
    it("should return 401 if route requires account (at least level 2)", async () => {
      mockResponse["locals"] = { user: { role: { level: 1 } } };
      const checkLevelMin2 = minLevel(2);
      checkLevelMin2(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
    it("should call next if route doesn't require account", async () => {
      mockResponse["locals"] = { user: { role: { level: 1 } } };
      const checkLevelMin2 = minLevel(1);
      checkLevelMin2(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
});
