import { getOrThrow } from "../../main/util/config";
import { expect } from "chai";
import request from "supertest";
import nock from "nock";
import { app } from "../../main/app";

const cookieName: string = getOrThrow<string>("session.cookieName");
const idamBaseUrl: string = getOrThrow<string>("idam.base_url");
const idamS2SUrl: string = getOrThrow<string>("idam.s2s_url");

describe("Home page", () => {

  beforeEach(() => {
    nock(idamBaseUrl).persist().get("/o/userinfo").reply(200, { uid: "1234" });

    nock(idamS2SUrl)
      .persist()
      .post("/lease")
      .reply(200, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJhZG1pbiI6dHJ1ZSwiZXhwIjoiIn0.ExHo7njTb2e6OQKPgi84Hcgo5k0tVwVvRrdGEV77uf0"); // fake token

  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe("on GET", () => {
    it("should return home page with authorization", async () => {
      await request(app)
        .get("/")
        .set("Authorization", "abc")
        .set("Cookie", `${cookieName}=ABC`)
        .expect((res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.text).to.include("<h1 class=\"govuk-heading-xl\">Welcome to CCD Case Print Service</h1>");
        });
    });

    it("should NOT return home page without authorization", async () => {
      await request(app)
        .get("/")
        .expect((res) => expect(res.statusCode).to.equal(401));
    });
  });
});
