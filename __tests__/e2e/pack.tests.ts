import supertest from "supertest";
import app from "../../src/app";

describe("get packs", () => {
  describe("given the pack doesn't exist", () => {
    it("should return 404", async () => {
      const res = await supertest(app).post(`/pack/${13024}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
