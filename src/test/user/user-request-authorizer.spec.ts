import * as chai from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import * as userReqAuth from "../../main/user/user-request-authorizer";
import {IHttpError} from "../../main/types/errors.types";

const expect = chai.expect;
chai.use(sinonChai);

describe("UserRequestAuthorizer", () => {
  describe("authorize", () => {

    const AUTHZ_HEADER = "Bearer cincwuewncew.cewnuceuncwe.cewucwbeu";
    const USER_ID = "1";
    const ROLE_1 = "role1";
    const DETAILS = {
      roles: [ROLE_1],
      uid: USER_ID,
    };
    const COOKIES = {
      [userReqAuth.COOKIE_ACCESS_TOKEN]: "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIxNW91NWFi",
    };

    let request;
    let userResolver;

    let userRequestAuthorizer;

    beforeEach(() => {
      request = {
        cookies: COOKIES,
        get: sinon.stub().returns(AUTHZ_HEADER),
      };
      userResolver = {
        getTokenDetails: sinon.stub().returns(Promise.resolve(DETAILS)),
      };

      userRequestAuthorizer = proxyquire("../../main/user/user-request-authorizer", {
      "./user-resolver": userResolver,
      });
    });

    it("should return resolved user details from the Authorization header", async () => {
      const result = await userRequestAuthorizer.authorise(request);

      expect(result).to.deep.equal(DETAILS);
      expect(userResolver.getTokenDetails).to.have.been.calledOnce;
      expect(userResolver.getTokenDetails).to.have.been.calledWith(AUTHZ_HEADER);
    });

    it("should reject when Authorization header is missing", (done) => {
      request.get.returns(null);

      userRequestAuthorizer.authorise(request)
        .then(() => done(new Error("Promise should have been rejected")))
        .catch((error) => {
          expect(error).to.equal(userRequestAuthorizer.ERROR_TOKEN_MISSING);
          done();
        });
    });

    it("should reject when user cannot be resolved", (done) => {
      const ERROR = new Error("oops") as IHttpError;
      ERROR.status = 401;
      userResolver.getTokenDetails.returns(Promise.reject(ERROR));

      userRequestAuthorizer.authorise(request)
        .then(() => done(new Error("Promise should have been rejected")))
        .catch((error) => {
          expect(error).to.equal(ERROR);
          done();
        });
    });

  });
});
