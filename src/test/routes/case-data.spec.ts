import { expect } from "chai";
import * as express from "express";
import * as expressNunjucks from "express-nunjucks";
import * as path from "path";
import * as proxyquire from "proxyquire";
import * as request from "supertest";
import * as sinon from "sinon";

describe("Case data route", () => {
  let getCase: sinon.SinonStub;
  let router: express.Router;

  beforeEach(() => {
    getCase = sinon.stub();

    const routeModule: any = proxyquire.noCallThru()("../../main/routes/case-data", {
      "../service/case-service": { getCase },
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
        AddressLine1: "102 Petty France",
      },
      case_type_id: "Grant",
      id: "123",
      jurisdiction: "PROBATE",
      OrganisationPolicyField1: {
        OrgPolicyCaseAssignedRole: "[Claimant]",
      },
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
});
