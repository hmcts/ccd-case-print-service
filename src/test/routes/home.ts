import { expect } from "chai";
import * as request from "supertest";

import { app } from "../../main/app";

describe("Home page", () => {
  describe("on GET", () => {
    it("should NOT return home page without authorization", async () => {
      await request(app)
        .get("/")
        .expect((res) => expect(res.statusCode).to.equal(401));
    });
  });

  // TODO RDM-1995 return a sample home page with mock authorize()
});
