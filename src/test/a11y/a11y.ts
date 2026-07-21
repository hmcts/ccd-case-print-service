
import * as config from "config";
import * as pa11y from "pa11y";
import * as supertest from "supertest";
import * as sinon from "sinon";
import { Logger } from "@hmcts/nodejs-logging";
import { app } from "../../main/app";
import { expect } from "chai";
import * as userResolver from "../../main/user/user-resolver";
import * as s2sResolver from "../../main/service/service-token-generator";
import * as caseService from "../../main/service/case-service";

app.locals.csrf = "dummy-token";
const cookieName: string = config.get("session.cookieName");
const agent = supertest(app);
const logger = Logger.getLogger("a11y");

export interface IIssue {
  type: string;
  code: string;
}

async function runPa11y(url: string, ignoreElements: any[]): Promise<IIssue[]> {
  const result = await pa11y(url, {
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
      ignoreHTTPSErrors: false,
    },
    headers: {
      Authorization: "abc",
      Cookie: `${cookieName}=ABC`,
    },
    // Ignore GovUK template elements that are outside the team's control from a11y tests
    hideElements: "#logo, .logo, .copyright, link[rel=mask-icon]",
    ignore: ignoreElements,
    includeWarnings: true,
    threshold: 9,
  });
  return result.issues;
}

function check(uri: string, ignoreElements?: any[]): void {
  describe(`Page ${uri}`, () => {
    describe(`Pa11y tests for ${uri}`, () => {
      let issues: IIssue[];
      let stubIdam: sinon.SinonStubbedInstance<typeof userResolver>;
      let stubS2S: sinon.SinonStubbedInstance<typeof s2sResolver>;
      before(async () => {
        stubIdam = sinon.stub(userResolver); // add stub
        stubIdam.getTokenDetails.returns(Promise.resolve("mocked-idam-token"));

        stubS2S = sinon.stub(s2sResolver); // add stub
        stubS2S.serviceTokenGenerator.returns(Promise.resolve("mocked-s2s-token"));

        const url = agent.get(uri).url;
        logger.info(`Running accessibility tests for ${url}`);
        issues = await runPa11y(url, ignoreElements || []);
      });

      after(() => {
        stubIdam.getTokenDetails.restore();  // remove idam stub
        stubS2S.serviceTokenGenerator.restore();  // remove s2s stub
      });

      it("should have no accessibility errors", () => {
        ensureNoAccessibilityAlerts("error", issues);
      });

      it("should have no accessibility warnings", () => {
        ensureNoAccessibilityAlerts("warning", issues);
      });
    });
  });
}

function ensureNoAccessibilityAlerts(issueType: string, issues: IIssue[]): void {
  const alerts: IIssue[] = issues.filter((issue: IIssue) => issue.type === issueType);
  logger.info(`alerts:: ${JSON.stringify(alerts)}`);
  expect(alerts, `\n${JSON.stringify(alerts, null, 2)}\n`).to.be.empty;
}

describe("Accessibility", () => {

  // testing accessibility of the home page
  check("/");
  check("/health", ["WCAG2AA.Principle2.Guideline2_4.2_4_2.H25.1.NoTitleEl",
    "WCAG2AA.Principle3.Guideline3_1.3_1_1.H57.2",
    "WCAG2AA.Principle1.Guideline1_4.1_4_10.C32,C31,C33,C38,SCR34,G206"]);
  check("/?jwt=%4xx");
  check("/not-found");

  // testing accessibility of a case details page with dummy data
  let stubCaseService: sinon.SinonStubbedInstance<typeof caseService>;
  before(async () => {
        stubCaseService = sinon.stub(caseService); // add case service stub
        stubCaseService.getCase.returns(Promise.resolve({id: 1234}));
  });
  after(() => {
        stubCaseService.getCase.restore();  // remove case service stub
  });
  check("/jurisdictions/AAA/case-types/BBB/cases/CCC",
    ["WCAG2AA.Principle1.Guideline1_4.1_4_10.C32,C31,C33,C38,SCR34,G206"]);
});
