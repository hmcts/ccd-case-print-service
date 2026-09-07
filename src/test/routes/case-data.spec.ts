import { expect } from "chai";
import * as sinon from "sinon";
const proxyquire = require("proxyquire").noCallThru();

describe("case data route", () => {
  const getCase = sinon.stub();
  const router = proxyquire("../../main/routes/case-data", {
    "../service/case-service": { getCase },
  });
  const handler = router.stack[0].route.stack[0].handle;
  const response = {
    send: sinon.stub(),
    status: sinon.stub().returnsThis(),
  };
  const request = {params: {jid: "j", ctid: "t", cid: "123"}};

  beforeEach(() => {
    getCase.reset();
    response.status.resetHistory();
    response.send.resetHistory();
  });

  it("returns a validation error", async () => {
    getCase.throws({code: "INVALID_CASE_ID", status: 400, error: "Bad Request"});

    handler({...request, params: {...request.params, cid: "bad"}}, response);
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.status.calledWith(400)).to.equal(true);
    expect(response.send.calledWith({code: "INVALID_CASE_ID", status: 400, error: "Bad Request"})).to.equal(true);
  });

  it("forwards an upstream response status and body", async () => {
    getCase.rejects({status: 404, response: {status: 404, size: 0, timeout: 0}});

    handler(request, response);
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.status.calledWith(404)).to.equal(true);
    expect(response.send.calledWith({status: 404, size: 0, timeout: 0})).to.equal(true);
  });

  it("uses the fallback status for an unrecognised error", async () => {
    getCase.rejects(new Error("unexpected"));

    handler(request, response);
    await new Promise((resolve) => setImmediate(resolve));

    expect(response.status.calledWith(500)).to.equal(true);
  });
});
