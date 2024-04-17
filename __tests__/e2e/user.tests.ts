import supertest from "supertest";
import app from "../../src/app";

const randomString = () => (Math.random() + 1).toString(36).substring(7);

describe("when user signs up for an account", () => {
  it("should respond with a success status", async () => {
    const response = await supertest(app)
      .post("/user/register")
      .send({
        name: `${randomString()} ${randomString()}`,
        email: `${randomString()}@lebenswiki.com`,
        password: "Test@1234",
        biography: "Lorem Ipsum dolor sit amed",
      });
    expect(response.statusCode == 201);
  });
});
