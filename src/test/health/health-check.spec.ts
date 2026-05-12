import { expect } from "chai";
import { EventEmitter } from "events";
import { app } from "../../main/app";

const httpMocks = require("node-mocks-http");

describe("health check", () => {
  it("should return 200 OK for health check", (done) => {
    verifyHealthEndpoint("/health", done);
  });

  it("should return 200 OK for liveness health check", (done) => {
    verifyHealthEndpoint("/health/liveness", done);
  });

  it("should return 200 OK for readiness health check", (done) => {
    verifyHealthEndpoint("/health/readiness", done);
  });
});

function verifyHealthEndpoint(url: string, done) {
  const req = httpMocks.createRequest({
    method: "GET",
    url,
  });
  const res = httpMocks.createResponse({ eventEmitter: EventEmitter });

  res.on("end", () => {
    expect(res._getStatusCode()).to.equal(200);
    expect(res._getJSONData().status).to.equal("UP");
    done();
  });

  app.handle(req, res, done);
}
