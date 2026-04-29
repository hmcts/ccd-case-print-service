import { expect } from "chai";
import { EventEmitter } from "events";
import * as httpMocks from "node-mocks-http";
import { app } from "../../main/app";

describe("health check", () => {
  it("should return 200 OK for health check", async () => {
    const res = await requestApp("/health");

    expect(res._getStatusCode()).equal(200);
    expect(res._getJSONData().status).equal("UP");
  });

  it("should return 200 OK for liveness health check", async () => {
    const res = await requestApp("/health/liveness");

    expect(res._getStatusCode()).equal(200);
    expect(res._getJSONData().status).equal("UP");
  });

  it("should return 200 OK for readiness health check", async () => {
    const res = await requestApp("/health/readiness");

    expect(res._getStatusCode()).equal(200);
    expect(res._getJSONData().status).equal("UP");
  });
});

function requestApp(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = httpMocks.createRequest({
      method: "GET",
      url,
    });
    const res = httpMocks.createResponse({
      eventEmitter: EventEmitter,
    });

    res.on("end", () => resolve(res));
    app.handle(req, res, reject);
  });
}
