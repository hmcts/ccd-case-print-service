import express from "express";
import expressNunjucks from "express-nunjucks";
import * as path from "path";
import proxyquire from "proxyquire";
import sinon from "sinon";
import { getOrThrow } from "../../main/util/config";
import { expect } from "chai";
import request from "supertest";
import nock from "nock";
import { app } from "../../main/app";
import { trackUnhandledRejections } from "../util/unhandled-rejections";

const cookieName: string = getOrThrow<string>("session.cookieName");
const caseDataStoreUrl: string = getOrThrow<string>("case_data_store_url");
const idamBaseUrl: string = getOrThrow<string>("idam.base_url");
const idamS2SUrl: string = getOrThrow<string>("idam.s2s_url");

describe("Case data page", () => {
  beforeEach(() => {
    nock(idamBaseUrl).persist().get("/o/userinfo").reply(200, { uid: "1234" });

    nock(idamS2SUrl)
      .persist()
      .post("/lease")
      .reply(200, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJhZG1pbiI6dHJ1ZSwiZXhwIjoiIn0.ExHo7njTb2e6OQKPgi84Hcgo5k0tVwVvRrdGEV77uf0"); // fake token

    nock(caseDataStoreUrl)
      .persist()
      .get("/caseworkers/1234/jurisdictions/SSCS/case-types/Appeal/cases/12345")
      .reply(200, { id: 12345 });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("on POST /case-data", () => {
    it("should redirect to case data page with correct parameters", async () => {
      await request(app)
        .post("/case-data")
        .set("Authorization", "abc")
        .set("Cookie", `${cookieName}=ABC`)
        .send({
          jurisdiction: "SSCS",
          caseType: "Appeal",
          caseId: "12345"
        })
        .expect((res) => {
          expect(res.statusCode).to.equal(303);
          expect(res.headers.location).to.equal(
            "/jurisdictions/SSCS/case-types/Appeal/cases/12345"
          );
        });
    });

    it("should redirect to case data page with formatted query parameter when formatted is true", async () => {
      await request(app)
        .post("/case-data")
        .set("Authorization", "abc")
        .set("Cookie", `${cookieName}=ABC`)
        .send({
          jurisdiction: "SSCS",
          caseType: "Appeal",
          caseId: "12345",
          formatted: true
        })
        .expect((res) => {
          expect(res.statusCode).to.equal(303);
          expect(res.headers.location).to.equal(
            "/jurisdictions/SSCS/case-types/Appeal/cases/12345?formatted=true"
          );
        });
    });

    it("should redirect to home page when parameters are missing", async () => {
      await request(app)
        .post("/case-data")
        .set("Authorization", "abc")
        .set("Cookie", `${cookieName}=ABC`)
        .send({})
        .expect((res) => {
          expect(res.statusCode).to.equal(303);
          expect(res.headers.location).to.equal("/");
        });
    });

    it("should NOT redirect to case data without authorization", async () => {
      await request(app)
        .post("/case-data")
        .send({
          jurisdiction: "SSCS",
          caseType: "Appeal",
          caseId: "12345"
        })
        .expect((res) => expect(res.statusCode).to.equal(401));
    });
  });

  describe("on GET /jurisdictions/:jid/case-types/:ctid/cases/:cid", () => {
    it("should return case data page when authorized", async () => {
      await request(app)
        .get("/jurisdictions/SSCS/case-types/Appeal/cases/12345")
        .set("Authorization", "abc")
        .set("Cookie", `${cookieName}=ABC`)
        .expect((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include("<strong>Printed on:</strong>");
        });
    });

    it("should return formatted case data page when formatted query parameter is true and authorized", async () => {
      await request(app)
        .get("/jurisdictions/SSCS/case-types/Appeal/cases/12345?formatted=true")
        .set("Authorization", "abc")
        .set("Cookie", `${cookieName}=ABC`)
        .expect((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include("<h1 class=\"govuk-heading-xl\">Case Data Printout</h1>");
        });
    });

    it("should return 404 when case data is not found", async () => {
      nock(caseDataStoreUrl)
        .get("/caseworkers/1234/jurisdictions/SSCS/case-types/Appeal/cases/99999")
        .reply(404);

      await request(app)
        .get("/jurisdictions/SSCS/case-types/Appeal/cases/99999")
        .set("Authorization", "abc")
        .set("Cookie", `${cookieName}=ABC`)
        .expect((res) => expect(res.statusCode).to.equal(404));
    });

    it("should NOT return case data without authorization", async () => {
      await request(app)
        .get("/jurisdictions/SSCS/case-types/Appeal/cases/12345")
        .expect((res) => expect(res.statusCode).to.equal(401));
    });
  });

});

describe("Case data route", () => {
  let getCase: sinon.SinonStub;
  let logger: { error: sinon.SinonStub };
  let router: express.Router;

  beforeEach(() => {
    getCase = sinon.stub();
    logger = { error: sinon.stub() };

    const routeModule: any = proxyquire.noCallThru()("../../main/routes/case-data", {
      "@hmcts/nodejs-logging": { Logger: { getLogger: () => logger } },
      "../service/case-service": { getCase }
    });
    router = routeModule.default || routeModule;
  });

  function appWithRouter() {
    const app = express();
    app.set("views", path.join(__dirname, "../../main/views"));
    app.set("view engine", "njk");
    expressNunjucks(app);
    app.use((req, res, next) => {
      req.authentication = { user: { given_name: "Test", family_name: "User", sub: "test" } };
      next();
    });
    app.use(router);
    return app;
  }

  it("returns the rendered case data", async () => {
    getCase.resolves({
      AddressUKField: {
        AddressLine1: "102 Petty France"
      },
      OrganisationPolicyField1: {
        OrgPolicyCaseAssignedRole: "[Claimant]"
      },
      case_type_id: "Grant",
      id: "123",
      jurisdiction: "PROBATE"
    });

    await request(appWithRouter())
      .get("/jurisdictions/PROBATE/case-types/Grant/cases/123")
      .expect(200)
      .expect("Content-Type", /text\/html/)
      .expect((res) => {
        expect(res.text).to.contain("<h1>Case Data Printout</h1>");
        expect(res.text).to.contain("Case Number:</strong> 123");
        expect(res.text).to.contain("Jurisdiction:</strong> PROBATE");
        expect(res.text).to.contain("Case Type:</strong> Grant");
        expect(res.text).to.contain("Printed by:</strong> Test User (test)");
        expect(res.text).to.match(/Printed on:<\/strong> .+/);
        expect(res.text).to.contain("= START =");
        expect(res.text).to.contain("= END =");
        expect(res.text).to.contain("AddressUKField");
        expect(res.text).to.contain("102 Petty France");
        expect(res.text).to.contain("OrganisationPolicyField1");
        expect(res.text).to.not.contain("password");
        expect(res.text).to.not.contain("ServiceAuthorization");
        expect(res.text).to.not.contain("Authorization");
      });

    expect(getCase.calledWith(sinon.match.object, "PROBATE", "Grant", "123")).to.equal(true);
  });

  it("returns the case service failure", async () => {
    getCase.rejects({ status: 404, message: "Case not found" });

    await request(appWithRouter())
      .get("/jurisdictions/PROBATE/case-types/Grant/cases/123")
      .expect(404)
      .expect((res) => expect(res.body.message).to.equal("Case not found"));
  });

  it("responds 500 when the case service rejects with a plain Error", async () => {
    const rejections = trackUnhandledRejections();
    const error = new Error("socket hang up");
    getCase.rejects(error);

    try {
      await request(appWithRouter())
        .get("/jurisdictions/PROBATE/case-types/Grant/cases/123")
        .timeout(1000)
        .expect(500);

      await rejections.settle();
      expect(rejections.reasons).to.be.empty;
      expect(logger.error.calledWith(sinon.match.string, error)).to.equal(true);
    } finally {
      rejections.stop();
    }
  });
});
