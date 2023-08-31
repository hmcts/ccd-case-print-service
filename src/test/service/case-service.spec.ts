import { expect } from "chai";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("case service", () => {

  let getCase;
  const serviceAuthorization = "Bearer dghdheh48";
  const req = {
    authentication: {
        user: {
            uid : "1234",
        },
    },
    cookies: {
      jwt: "hfsjkfdhsk",
    },
    get: sinon.stub(),
    headers: {
      ServiceAuthorization : serviceAuthorization,
    },
  };

  const expectedErrorStatus = 400;
  const expectedError = "Bad Request";
  const expectedErrorMessage = "Case ID must be a valid number";

  beforeEach(() => {
    const config = {
      get: sinon.stub(),
    };
    config.get.withArgs("case_data_store_url").returns("http://localhost:4104");
    getCase = proxyquire("../../main/service/case-service", {
      config,
    }).getCase;
  });

  describe("getCase()", () => {
    it("should return a case", async (replyFnWithCallback: (this: nock.ReplyFnContext, uri: string, body: nock.Body, callback: (err: (NodeJS.ErrnoException | null), result: nock.ReplyFnResult) => void) => void) => {

      const jid = "jurisdiction";
      const ctid = "caseTemplateId";
      const cid = "1234";
      const expectedResult = 1234;
      req.get.withArgs("Authorization").returns(serviceAuthorization);

      nock("http://localhost:4104")
        .get("/caseworkers/1234/jurisdictions/" + jid + "/case-types/" + ctid +
          "/cases/" + cid)
        .reply(200, expectedResult);
      const result = await getCase(req, jid, ctid, cid);
      expect(result).to.deep.equal(expectedResult);
    });

    it("should return an error when not a NaN", async () => {

        const jid = "jurisdiction";
        const ctid = "caseTemplateId";
        const cid = "1A";
        try {
            await getCase(req, jid, ctid, cid);
        } catch (error) {
            expect(error.status).to.deep.equal(expectedErrorStatus);
            expect(error.error).to.deep.equal(expectedError);
            expect(error.message).to.deep.equal(expectedErrorMessage);
        }
    });
  });

});
