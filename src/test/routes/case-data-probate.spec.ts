import { expect } from "chai";
import { EnumerationAttemptError } from "guard/enumeration-attempt-error";
import * as express from "express";
import * as proxyquire from "proxyquire";
import * as request from "supertest";
import * as sinon from "sinon";

describe("Probate case routes", () => {
  let getCase: sinon.SinonStub;
  let getProbateCaseDetailsTemplate: sinon.SinonStub;
  let getProbateManLegacyCase: sinon.SinonStub;
  let getProbateManLegacyCaseTemplate: sinon.SinonStub;
  let checkForEnumerationAttempt: sinon.SinonStub;
  let router: express.Router;

  beforeEach(() => {
    getCase = sinon.stub();
    getProbateCaseDetailsTemplate = sinon.stub();
    getProbateManLegacyCase = sinon.stub();
    getProbateManLegacyCaseTemplate = sinon.stub();
    checkForEnumerationAttempt = sinon.stub();

    const routeModule: any = proxyquire.noCallThru()("../../main/routes/case-data-probate", {
      "../guard/enumeration-check-probate-man-type": { checkForEnumerationAttempt },
      "../service/case-service": { getCase },
      "../service/probate-man-service": { getProbateManLegacyCase },
      "../service/probate-man-template-service": { getProbateManLegacyCaseTemplate },
      "../service/template-service": { getProbateCaseDetailsTemplate },
    });
    router = routeModule.default || routeModule;
  });

  function appWithRouter() {
    const app = express();
    app.use((req, res, next) => {
      req.authentication = { user: { uid: "testuid" } };
      next();
    });
    app.use(router);
    return app;
  }

  describe("GET /jurisdictions/:jid/case-types/:ctid/cases/:cid/probate/:tid", () => {
    it("returns the rendered probate case", async () => {
      getCase.resolves({ caseId: "123" });
      getProbateCaseDetailsTemplate.resolves("Case {{ caseId }}");

      await request(appWithRouter())
        .get("/jurisdictions/PROBATE/case-types/Grant/cases/123/probate/summary")
        .expect(200)
        .expect("Case 123");

      expect(getCase.calledWith(sinon.match.object, "PROBATE", "Grant", "123")).to.equal(true);
      expect(getProbateCaseDetailsTemplate.calledWith(
        sinon.match.object, "PROBATE", "Grant", "123", "summary")).to.equal(true);
    });

    it("returns the case lookup failure", async () => {
      getCase.rejects({ status: 404, message: "Case not found" });

      await request(appWithRouter())
        .get("/jurisdictions/PROBATE/case-types/Grant/cases/123/probate/summary")
        .expect(404)
        .expect((res) => expect(res.body.message).to.equal("Case not found"));
    });

    it("returns the template lookup failure", async () => {
      getCase.resolves({ caseId: "123" });
      getProbateCaseDetailsTemplate.rejects({ status: 502, message: "Template service unavailable" });

      await request(appWithRouter())
        .get("/jurisdictions/PROBATE/case-types/Grant/cases/123/probate/summary")
        .expect(502)
        .expect((res) => expect(res.body.message).to.equal("Template service unavailable"));
    });
  });

  describe("GET /probateManTypes/:probateManType/cases/:caseId", () => {
    it("returns the rendered legacy probate case", async () => {
      checkForEnumerationAttempt.resolves("OK");
      getProbateManLegacyCase.resolves({ caseId: "123" });
      getProbateManLegacyCaseTemplate.resolves("Legacy {{ caseId }}");

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/123")
        .expect(200)
        .expect("Legacy 123");

      expect(checkForEnumerationAttempt.calledWith("testuid", "CAVEAT", "123")).to.equal(true);
      expect(getProbateManLegacyCase.calledWith(sinon.match.object, "CAVEAT", "123")).to.equal(true);
      expect(getProbateManLegacyCaseTemplate.calledWith(sinon.match.object)).to.equal(true);
    });

    it("returns an invalid case ID failure", async () => {
      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/not-a-number")
        .expect(400)
        .expect((res) => expect(res.body.message).to.equal("Case ID must be a valid number"));

      expect(checkForEnumerationAttempt.notCalled).to.be.true;
      expect(getProbateManLegacyCase.notCalled).to.be.true;
      expect(getProbateManLegacyCaseTemplate.notCalled).to.be.true;
    });

    it("returns a resource not found failure for an enumeration attempt", async () => {
      checkForEnumerationAttempt.rejects(new EnumerationAttemptError("ENUMERATION ATTEMPT", "Not Found", 404));

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/124")
        .expect(404);

      expect(checkForEnumerationAttempt.calledWith("testuid", "CAVEAT", "124")).to.be.true;
      expect(getProbateManLegacyCase.notCalled).to.be.true;
      expect(getProbateManLegacyCaseTemplate.notCalled).to.be.true;
    });

    it("returns expected failure if enumeration check fails with error without an error code", async () => {
      checkForEnumerationAttempt
        .rejects({ message : "No error code error message", error : "No error code error", status : 400 });

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/124")
        .expect(400)
        .expect((res) => expect(res.body.message).to.equal("No error code error message"));

      expect(checkForEnumerationAttempt.calledWith("testuid", "CAVEAT", "124")).to.be.true;
      expect(getProbateManLegacyCase.notCalled).to.be.true;
      expect(getProbateManLegacyCaseTemplate.notCalled).to.be.true;
    });

    it("returns expected failure if enumeration check fails with error with other error code", async () => {
      checkForEnumerationAttempt
        .rejects({ code: "OTHER_ERROR", message : "Other error message", error : "Other error", status : 401 });

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/124")
        .expect(401)
        .expect((res) => expect(res.body.message).to.equal("Other error message"));

      expect(checkForEnumerationAttempt.calledWith("testuid", "CAVEAT", "124")).to.be.true;
      expect(getProbateManLegacyCase.notCalled).to.be.true;
      expect(getProbateManLegacyCaseTemplate.notCalled).to.be.true;
    });

    it("returns a downstream case failure", async () => {
      checkForEnumerationAttempt.resolves("OK");
      getProbateManLegacyCase.rejects({ status: 404, message: "Legacy case not found" });

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/123")
        .expect(404)
        .expect((res) => expect(res.body.message).to.equal("Legacy case not found"));

      expect(checkForEnumerationAttempt.calledWith("testuid", "CAVEAT", "123")).to.equal(true);
      expect(getProbateManLegacyCase.calledWith(sinon.match.object, "CAVEAT", "123")).to.equal(true);
    });

    it("returns a template lookup failure", async () => {
      checkForEnumerationAttempt.resolves("OK");
      getProbateManLegacyCase.resolves({ caseId: "123" });
      getProbateManLegacyCaseTemplate.rejects({ status: 502, message: "Template service unavailable" });

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/123")
        .expect(502)
        .expect((res) => expect(res.body.message).to.equal("Template service unavailable"));

      expect(checkForEnumerationAttempt.calledWith("testuid", "CAVEAT", "123")).to.equal(true);
      expect(getProbateManLegacyCase.calledWith(sinon.match.object, "CAVEAT", "123")).to.equal(true);
      expect(getProbateManLegacyCaseTemplate.calledWith(sinon.match.object)).to.equal(true);
    });
  });
});
