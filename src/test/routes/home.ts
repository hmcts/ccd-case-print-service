import { expect } from "chai";
import * as request from "supertest";

import { app } from "../../main/app";

describe("Home page", () => {
  describe("on GET", () => {
    it("should return sample home page", async () => {
      await request(app)
        .get("/")
        .expect((res) => expect(res.statusCode).to.equal(401));
    });
  });
});
