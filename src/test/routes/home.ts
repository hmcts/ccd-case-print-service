import { expect } from "chai";
import * as http from "http";
import * as request from "supertest";

import { app } from "../../main/app";
import { close, listen } from "../helpers/supertest-server";

describe("Home page", () => {
  let server: http.Server;

  before(async () => {
    server = await listen(app);
  });

  after(async () => {
    await close(server);
  });

  describe("on GET", () => {
    it("should NOT return home page without authorization", async () => {
      await request(server)
        .get("/")
        .expect((res) => expect(res.statusCode).to.equal(401));
    });
  });

  // TODO RDM-1995 return a sample home page with mock authorize()
});
