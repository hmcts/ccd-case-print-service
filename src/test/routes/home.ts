import { expect } from "chai";
import { EventEmitter } from "events";
import * as httpMocks from "node-mocks-http";

import { app } from "../../main/app";

describe("Home page", () => {
  describe("on GET", () => {
    it("should NOT return home page without authorization", async () => {
      const res = await requestApp("/");

      expect(res._getStatusCode()).to.equal(401);
    });
  });

  // TODO RDM-1995 return a sample home page with mock authorize()
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
