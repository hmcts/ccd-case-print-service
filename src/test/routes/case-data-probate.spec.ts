import { expect } from "chai";
import express from "express";
import proxyquire from "proxyquire";
import request from "supertest";
import sinon from "sinon";
import { trackUnhandledRejections } from "../util/unhandled-rejections";

describe("Probate case routes", () => {
  let getCase: sinon.SinonStub;
  let getProbateCaseDetailsTemplate: sinon.SinonStub;
  let getProbateManLegacyCase: sinon.SinonStub;
  let getProbateManLegacyCaseTemplate: sinon.SinonStub;
  let logger: { error: sinon.SinonStub; warn: sinon.SinonStub };
  let router: express.Router;

  beforeEach(() => {
    getCase = sinon.stub();
    getProbateCaseDetailsTemplate = sinon.stub();
    getProbateManLegacyCase = sinon.stub();
    getProbateManLegacyCaseTemplate = sinon.stub();
    logger = { error: sinon.stub(), warn: sinon.stub() };

    const routeModule: any = proxyquire.noCallThru()("../../main/routes/case-data-probate", {
      "@hmcts/nodejs-logging": { Logger: { getLogger: () => logger } },
      "../service/case-service": { getCase },
      "../service/probate-man-service": { getProbateManLegacyCase },
      "../service/probate-man-template-service": { getProbateManLegacyCaseTemplate },
      "../service/template-service": { getProbateCaseDetailsTemplate }
    });
    router = routeModule.default || routeModule;
  });

  function appWithRouter() {
    const app = express();
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
      getProbateManLegacyCase.resolves({ caseId: "123" });
      getProbateManLegacyCaseTemplate.resolves("Legacy {{ caseId }}");

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/123")
        .expect(200)
        .expect("Legacy 123");

      expect(getProbateManLegacyCase.calledWith(sinon.match.object, "CAVEAT", "123")).to.equal(true);
      expect(getProbateManLegacyCaseTemplate.calledWith(sinon.match.object)).to.equal(true);
    });

    it("returns an invalid case ID failure", async () => {
      getProbateManLegacyCase.rejects({ status: 400, message: "Case ID must be a valid number" });

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/not-a-number")
        .expect(400)
        .expect((res) => expect(res.body.message).to.equal("Case ID must be a valid number"));
    });

    it("returns a downstream case failure", async () => {
      getProbateManLegacyCase.rejects({ status: 404, message: "Legacy case not found" });

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/123")
        .expect(404)
        .expect((res) => expect(res.body.message).to.equal("Legacy case not found"));
    });

    it("returns a template lookup failure", async () => {
      getProbateManLegacyCase.resolves({ caseId: "123" });
      getProbateManLegacyCaseTemplate.rejects({ status: 502, message: "Template service unavailable" });

      await request(appWithRouter())
        .get("/probateManTypes/CAVEAT/cases/123")
        .expect(502)
        .expect((res) => expect(res.body.message).to.equal("Template service unavailable"));
    });
  });

  // Express 5 throws on res.status(undefined); unhandled, that rejection crashed the pod in PROD.
  describe("when a step fails without an HTTP status", () => {
    const SOL_PATH = "/jurisdictions/PROBATE/case-types/Grant/cases/123/probate/sol";
    const PROBATE_MAN_PATH = "/probateManTypes/CAVEAT/cases/123";
    let rejections: ReturnType<typeof trackUnhandledRejections>;

    beforeEach(() => {
      rejections = trackUnhandledRejections();
    });

    afterEach(() => {
      rejections.stop();
    });

    async function expect500AndErrorLogged(path: string, error?: Error) {
      await request(appWithRouter())
        .get(path)
        .timeout(1000)
        .expect(500);

      await rejections.settle();
      expect(rejections.reasons).to.be.empty;
      expect(logger.error.calledWith(sinon.match.string, error || sinon.match.instanceOf(Error))).to.equal(true);
    }

    it("responds 500 when the case lookup rejects with a plain Error", async () => {
      const error = new Error("socket hang up");
      getCase.rejects(error);

      await expect500AndErrorLogged(SOL_PATH, error);
    });

    it("responds 500 when the case details template lookup rejects with a plain Error", async () => {
      const error = new Error("socket hang up");
      getCase.resolves({ caseId: "123" });
      getProbateCaseDetailsTemplate.rejects(error);

      await expect500AndErrorLogged(SOL_PATH, error);
    });

    it("responds 500 when the case details template fails to render", async () => {
      getCase.resolves({ caseId: "123" });
      getProbateCaseDetailsTemplate.resolves("{{ caseId | noSuchFilter }}");

      await expect500AndErrorLogged(SOL_PATH);
    });

    it("responds 500 when the legacy case lookup rejects with a plain Error", async () => {
      const error = new Error("socket hang up");
      getProbateManLegacyCase.rejects(error);

      await expect500AndErrorLogged(PROBATE_MAN_PATH, error);
    });

    it("responds 500 when the legacy case template lookup rejects with a plain Error", async () => {
      const error = new Error("socket hang up");
      getProbateManLegacyCase.resolves({ caseId: "123" });
      getProbateManLegacyCaseTemplate.rejects(error);

      await expect500AndErrorLogged(PROBATE_MAN_PATH, error);
    });
  });
});
