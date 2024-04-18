import supertest from "supertest";
import app from "../../src/app";
import db from "../../src/database/database";

const randomString = () => (Math.random() + 1).toString(36).substring(7);

const name = randomString();
const email = randomString() + "." + randomString() + "@lebenswiki.com";
const password = "Test@123456";

describe("the user login and registration process", () => {
  describe("when the user signs up with valid inputs", () => {
    it("should respond with a success status on login", async () => {
      await supertest(app)
        .post("/user/register")
        .send({
          name: name,
          email: email,
          password: password,
          biography: "Lorem Ipsum dolor sit amed",
        })
        .expect(201);
    });

    it("should respond with successful status code on registration", async () => {
      await supertest(app)
        .post("/user/login")
        .send({ email: email, password: password })
        .expect(200);
    });
  });

  describe("when a user makes mistakes during login and registration", () => {
    describe("when user enters wrong email", () => {
      it("should return a error message and 404", async () => {
        await supertest(app)
          .post("/user/login")
          .send({ email: "lafasdfas@lebenswiki.com", password: "Test@1234" })
          .expect(404)
          .expect((res) => {
            res.body.message = "Email Address or Password was invalid";
          });
      });
    });

    describe("when user enters wrong password", () => {
      it("should return a error message and 404", async () => {
        await supertest(app)
          .post("/user/login")
          .send({ email: "lafasdfas@lebenswiki.com", password: "Test@1234" })
          .expect(404)
          .expect((res) => {
            res.body.message = "Email Address or Password was invalid";
          });
      });
    });

    describe("when user doesn't enter a long enough password", () => {
      it("should return a bad format error code and message", async () => {
        await supertest(app)
          .post("/user/register")
          .send({
            name: name,
            email: email,
            password: "Tst@1",
            biography: "Lorem Ipsum dolor sit amed",
          })
          .expect(400)
          .expect((res) => {
            res.body.id = 101;
            res.body.message = "Password has bad format";
          });
      });
    });
  });
});
