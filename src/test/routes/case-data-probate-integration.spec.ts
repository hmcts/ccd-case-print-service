import { expect } from "chai";
import cookieParser from "cookie-parser";
import express from "express";
import nock from "nock";
import proxyquire from "proxyquire";
import request from "supertest";
import { getOrThrow } from "../../main/util/config";
import { trackUnhandledRejections } from "../util/unhandled-rejections";

// Real serviceFilter, route and services behind a real Express app, so `req.get` and Node's lower-cased
// incoming headers behave as in PROD. Only the S2S token generator is stubbed; config is the test config.
describe("Probate routes with real service filter and services", () => {
  const CCD_PS_TOKEN = "S2S_FROM_CCD_PS";
  const CALLER_TOKEN = "S2S_FROM_CALLER_XUI";
  const CASE_ID = "79927398713";
  const USER_ID = "u1";

  const caseDataStoreUrl = getOrThrow<string>("case_data_store_url");
  const probateUrl = getOrThrow<string>("case_data_probate_template_url");

  const SOL_PATH = `/jurisdictions/PROBATE/case-types/GrantOfRepresentation/cases/${CASE_ID}/probate/sol`;
  const PROBATE_MAN_PATH = `/probateManTypes/CAVEAT/cases/${CASE_ID}`;

  let outbound: Record<string, string[]>;
  let rejections: ReturnType<typeof trackUnhandledRejections>;

  function recordAndReply(name: string, body: any) {
    return function (this: any) {
      (outbound[name] = outbound[name] || []).push(this.req.headers.serviceauthorization);
      return [200, body];
    };
  }

  function mockDownstream(caseData: any, solTemplate: string, legacyTemplate: string) {
    return [
      nock(caseDataStoreUrl)
        .get(`/caseworkers/${USER_ID}/jurisdictions/PROBATE/case-types/GrantOfRepresentation/cases/${CASE_ID}`)
        .reply(recordAndReply("dataStoreCase", caseData)),
      nock(probateUrl)
        .get("/template/case-details/sol")
        .reply(recordAndReply("boSolTemplate", solTemplate))
        .get(`/probateManTypes/CAVEAT/cases/${CASE_ID}`)
        .reply(recordAndReply("boLegacyCase", caseData))
        .get("/template/probateManLegacyCase")
        .reply(recordAndReply("boLegacyTemplate", legacyTemplate))
    ];
  }

  function appUnderTest() {
    const { serviceFilter } = proxyquire("../../main/service/service-filter", {
      "./service-token-generator": { serviceTokenGenerator: () => Promise.resolve(CCD_PS_TOKEN) }
    });
    const routeModule: any = proxyquire("../../main/routes/case-data-probate", {});

    const app = express();
    app.use(cookieParser());
    app.use((req: any, res, next) => {
      req.authentication = { user: { uid: USER_ID } };
      next();
    });
    app.use(serviceFilter);
    app.use(routeModule.default || routeModule);
    return app;
  }

  beforeEach(() => {
    outbound = {};
    rejections = trackUnhandledRejections();
  });

  afterEach(async () => {
    await rejections.settle();
    rejections.stop();
    nock.cleanAll();
  });

  describe("outbound ServiceAuthorization", () => {
    const callerHeaders: Array<[string, Record<string, string>]> = [
      ["the caller sends its own ServiceAuthorization", { ServiceAuthorization: CALLER_TOKEN }],
      ["the caller sends no ServiceAuthorization", {}]
    ];

    callerHeaders.forEach(([scenario, headers]) => {
      describe(`when ${scenario}`, () => {
        it("sends the ccd_ps token to the data store and BO on /probate/sol", async () => {
          mockDownstream({ id: CASE_ID }, "Case {{ id }}", "");

          await request(appUnderTest())
            .get(SOL_PATH)
            .set("Authorization", "Bearer user")
            .set(headers)
            .timeout(1000)
            .expect(200);

          expect(outbound).to.deep.equal({
            boSolTemplate: [CCD_PS_TOKEN],
            dataStoreCase: [CCD_PS_TOKEN]
          });
        });

        it("sends the ccd_ps token to both BO calls on /probateManTypes", async () => {
          mockDownstream({ id: CASE_ID }, "", "Legacy {{ id }}");

          await request(appUnderTest())
            .get(PROBATE_MAN_PATH)
            .set("Authorization", "Bearer user")
            .set(headers)
            .timeout(1000)
            .expect(200);

          expect(outbound).to.deep.equal({
            boLegacyCase: [CCD_PS_TOKEN],
            boLegacyTemplate: [CCD_PS_TOKEN]
          });
        });
      });
    });
  });

  // Snippets taken from BO's caseDetailsSOL.html / caseDetailsPA.html.
  describe("BO template filters", () => {
    const caseData = {
      case_data: {
        applicationSubmittedDate: "2026-10-25T10:15:00.000",
        deceasedDateOfBirth: "1950-01-31",
        ihtNetValue: 1234.5
      },
      id: CASE_ID
    };

    const snippets: Array<[string, string, string]> = [
      ["date with a format", "{{ case_data.applicationSubmittedDate | date(\"DD/MM/YYYY\") }}", "25/10/2026"],
      ["date with existingFormat",
        "{{ case_data.deceasedDateOfBirth | date(\"DD/MM/YYYY\", existingFormat=\"yyyy-MM-dd\") }}", "31/01/1950"],
      ["money", "{{ case_data.ihtNetValue | money('0,0.00') }}", "1,234.50"]
    ];

    snippets.forEach(([name, snippet, expected]) => {
      it(`renders ${name} on /probate/sol`, async () => {
        mockDownstream(caseData, `<p>${snippet}</p>`, "");

        await request(appUnderTest())
          .get(SOL_PATH)
          .set("Authorization", "Bearer user")
          .timeout(1000)
          .expect(200)
          .expect(`<p>${expected}</p>`);

        expect(rejections.reasons).to.be.empty;
      });
    });

    it("renders date and money on /probateManTypes", async () => {
      mockDownstream(caseData, "", snippets.map(([, snippet]) => snippet).join("|"));

      await request(appUnderTest())
        .get(PROBATE_MAN_PATH)
        .set("Authorization", "Bearer user")
        .timeout(1000)
        .expect(200)
        .expect("25/10/2026|31/01/1950|1,234.50");
    });
  });
});
