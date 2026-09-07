import { expect } from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("serviceFilter", () => {
  let serviceFilter;
  let serviceTokenGenerator;

  beforeEach(() => {
    serviceTokenGenerator = sinon.stub()
      .returns(Promise.resolve("service-token"));

    serviceFilter = proxyquire.noPreserveCache()(
      "../../main/service/service-filter",
      {
        "./service-token-generator": {
          serviceTokenGenerator,
        },
      },
    ).serviceFilter;
  });

  it("should add the service token and call next", async () => {
    const req: {headers: {[key: string]: string}} = {headers: {}};
    const res = {};
    const next = sinon.spy();

    serviceFilter(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(req.headers.ServiceAuthorization).to.equal("service-token");
    expect(next).to.have.been.calledOnce;
  });

  it("should pass a 401 error to next when token generation fails", async () => {
    const req: {headers: {[key: string]: string}} = {headers: {}};
    const res = {};
    const next = sinon.spy();

    serviceTokenGenerator.returns(Promise.reject({}));

    serviceFilter(req, res, next);

    await new Promise((resolve) => setImmediate(resolve));

    expect(next).to.have.been.calledOnce;
    expect(next).to.have.been.calledWith({status: 401});
  });
});
