import * as config from "config";
import * as jwt from "jsonwebtoken";
import * as moment from "moment";
import * as nock from "nock";
import * as proxyquire from "proxyquire";
import * as request from "supertest";
import * as sinon from "sinon";
import { Express } from "express";

describe("rate-limit-app", () => {

    const URL_IDAM_BASE: string = config.get("idam.base_url");
    const URL_IDAM_S2S: string = config.get("idam.s2s_url");
    const URL_CASE_DATA_PROBATE_TEMPLATE: string = config.get("case_data_probate_template_url");

    const PROPERTY_SECURITY: string = "security";
    const PROPERTY_RATE_LIMIT_ENABLED: string = "guard.rateLimit.enabled";

    const HEADER_AUTHORIZATION: string = "Authorization";

    const AUTH_TOKEN_USER_ONE: string = "Bearer AuthTokenUserOne";
    const AUTH_TOKEN_USER_TWO: string = "Bearer AuthTokenUserTwo";

    const USER_UID_ONE: string = "testUidOne";
    const USER_UID_TWO: string = "testUidTwo";

    const REQUEST_PROBATEMANTYPES: string = "/probatemantypes/CAVEAT/cases/1234";
    const REQUEST_HOME: string = "/";

    const RESPONSE_PROBATE_CASE_DATA: any = { probateManCase: { type: "Caveat" } };
    const RESPONSE_PROBATE_CASE_DATA_TEMPLATE: string =
        "<html><head><title>ProbateMan Legacy Case</head><body><h1>{{ probateManCase.type }}</h1></body></html>";

    const RESPONSE_BODY_PROBATEMANTYPES: string =
        "<html><head><title>ProbateMan Legacy Case</head><body><h1>Caveat</h1></body></html>";
    const RESPONSE_BODY_TOO_MANY_REQUESTS: string = "Too many requests, please try again later.";

    const TWO_TIMES: number = 2;

    let configGetStub: sinon.SinonStub;
    let app: Express;

    describe("Rate limit enabled", () => {

        beforeEach(function() {
            this.timeout(10000);

            configGetStub = sinon.stub();
            configGetStub.withArgs(PROPERTY_SECURITY).returns({ referrerPolicy: "origin" });
            configGetStub.withArgs(PROPERTY_RATE_LIMIT_ENABLED).returns(true);

            app = proxyquire("../../main/app.ts", {
                config: { get: configGetStub },
            }).app;
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it("Rate limit should be triggered for second probatemantypes request by user", async () => {
            mockIdamUserInfo(AUTH_TOKEN_USER_ONE, USER_UID_ONE, TWO_TIMES);
            mockIdamLease(TWO_TIMES);
            mockProbateCaseData(TWO_TIMES);
            mockProbateTemplate(TWO_TIMES);

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(429, RESPONSE_BODY_TOO_MANY_REQUESTS);
        });

        it("Rate limit should not be triggered for subsequent non-probatemantypes request by user", async () => {
            mockIdamUserInfo(AUTH_TOKEN_USER_ONE, USER_UID_ONE, TWO_TIMES);
            mockIdamLease(TWO_TIMES);
            mockProbateCaseData();
            mockProbateTemplate();

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);

            await request(app)
                .get(REQUEST_HOME)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200);
        });

        it("Rate limit should not be triggered for non-probatemantypes requests by user", async () => {
            mockIdamUserInfo(AUTH_TOKEN_USER_ONE, USER_UID_ONE, TWO_TIMES);
            mockIdamLease(TWO_TIMES);

            await request(app)
                .get(REQUEST_HOME)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200);

            await request(app)
                .get(REQUEST_HOME)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200);
        });

        it("Rate limit should not be triggered for probatemantypes requests for two different users", async () => {
            mockIdamUserInfo(AUTH_TOKEN_USER_ONE, USER_UID_ONE);
            mockIdamUserInfo(AUTH_TOKEN_USER_TWO, USER_UID_TWO);
            mockIdamLease(TWO_TIMES);
            mockProbateCaseData(TWO_TIMES);
            mockProbateTemplate(TWO_TIMES);

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_TWO)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);
        });

        it("Rate limit should not be triggered when window period is exceeded", async () => {
            mockIdamUserInfo(AUTH_TOKEN_USER_ONE, USER_UID_ONE, TWO_TIMES);
            mockIdamLease(TWO_TIMES);
            mockProbateCaseData(TWO_TIMES);
            mockProbateTemplate(TWO_TIMES);

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);

            await new Promise((resolve) => setTimeout(resolve, 1500));

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);
        });
    });

    describe("Rate limit disabled", () => {

        beforeEach(function() {
            this.timeout(10000);

            configGetStub = sinon.stub();
            configGetStub.withArgs(PROPERTY_SECURITY).returns({ referrerPolicy: "origin" });
            configGetStub.withArgs(PROPERTY_RATE_LIMIT_ENABLED).returns(false);

            app = proxyquire("../../main/app.ts", {
                config: { get: configGetStub },
            }).app;
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it("Rate limit should not be triggered for second probatemantypes request by user", async () => {
            mockIdamUserInfo(AUTH_TOKEN_USER_ONE, USER_UID_ONE, TWO_TIMES);
            mockIdamLease(TWO_TIMES);
            mockProbateCaseData(TWO_TIMES);
            mockProbateTemplate(TWO_TIMES);

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);

            await request(app)
                .get(REQUEST_PROBATEMANTYPES)
                .set(HEADER_AUTHORIZATION, AUTH_TOKEN_USER_ONE)
                .expect(200, RESPONSE_BODY_PROBATEMANTYPES);
        });
    });

    function mockIdamUserInfo(authToken: string, userUid: string, numTimes: number = 1) {
        nock(URL_IDAM_BASE)
            .get("/o/userinfo")
            .times(numTimes)
            .matchHeader(HEADER_AUTHORIZATION, authToken)
            .reply(200, { uid: userUid });
    }

    function mockIdamLease(numTimes: number) {
        const testJwt = jwt.sign({exp: moment().unix()}, "test");
        nock(URL_IDAM_S2S)
            .post("/lease")
            .times(numTimes)
            .reply(200, testJwt);
    }

    function mockProbateCaseData(numTimes: number = 1) {
        nock(URL_CASE_DATA_PROBATE_TEMPLATE)
            .get("/probateManTypes/CAVEAT/cases/1234")
            .times(numTimes)
            .reply(200, RESPONSE_PROBATE_CASE_DATA);
    }

    function mockProbateTemplate(numTimes: number = 1) {
        nock(URL_CASE_DATA_PROBATE_TEMPLATE)
            .get("/template/probateManLegacyCase")
            .times(numTimes)
            .reply(200, RESPONSE_PROBATE_CASE_DATA_TEMPLATE);
    }
});
