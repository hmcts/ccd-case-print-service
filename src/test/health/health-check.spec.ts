import { expect } from "chai";
import * as http from "http";
import * as request from "supertest";
import { app } from "../../main/app";
import { close, listen } from "../helpers/supertest-server";

describe("health check", () => {
  let server: http.Server;

  before(async () => {
    server = await listen(app);
  });

  after(async () => {
    await close(server);
  });

  it("should return 200 OK for health check", async () => {
    await request(server)
      .get("/health")
      .expect((res) => {
        expect(res.status).equal(200);
        expect(res.body.status).equal("UP");
      });
  });

  it("should return 200 OK for liveness health check", async () => {
    await request(server)
      .get("/health/liveness")
      .expect((res) => {
        expect(res.status).equal(200);
        expect(res.body.status).equal("UP");
      });
  });

  it("should return 200 OK for readiness health check", async () => {
    await request(server)
      .get("/health/readiness")
      .expect((res) => {
        expect(res.status).equal(200);
        expect(res.body.status).equal("UP");
      });
  });
});
