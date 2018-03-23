import { expect } from "chai";
import { EventEmitter } from "events";
import { setJwtCookieAndRedirect } from "../../main/util/set-jwt-cookie-and-redirect";

import httpMocks = require("node-mocks-http");

const jwt = "jwt";

function buildResponse() {
  return httpMocks.createResponse({ eventEmitter: EventEmitter });
}

describe("set JWT from request URL as cookie and perform redirect", () => {
  it("should set a secure cookie with the JWT," +
    " and redirect to the request URL without the JWT or query string separator", (done) => {
    const token = "eyJhbG.eyJzdW.4pcPyM";
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/ccd/documents?jwt=" + token,
    });
    const res = buildResponse();
    const next = () => {
      // empty body intended
    };

    res.on("end", () => {
      expect(res.cookies).to.have.property(jwt);
      const cookie = res.cookies[jwt];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.equal(true);
      expect(cookie.options.secure).to.equal(true);
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal("/ccd/documents");
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });

  it("should set the JWT cookie," +
    " and redirect to the request URL with only the JWT removed from the query string start", (done) => {
    const token = "eyJhbG.eyJzdW.4pcPyM";
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/ccd/documents?jwt=" + token + "&documentType=default",
    });
    const res = buildResponse();
    const next = () => {
      // empty body intended
    };

    res.on("end", () => {
      expect(res.cookies).to.have.property(jwt);
      const cookie = res.cookies[jwt];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.equal(true);
      expect(cookie.options.secure).to.equal(true);
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal("/ccd/documents?documentType=default");
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });

  it("should set the JWT cookie, and redirect to the request URL with only the JWT removed from the query string end",
    (done) => {
    const token = "eyJhbG.eyJzdW.4pcPyM";
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/ccd/documents?documentType=default&jwt=" + token,
    });
    const res = buildResponse();
    const next = () => {
      // empty body intended
    };

    res.on("end", () => {
      expect(res.cookies).to.have.property(jwt);
      const cookie = res.cookies[jwt];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.equal(true);
      expect(cookie.options.secure).to.equal(true);
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal("/ccd/documents?documentType=default");
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });

  it("should set the JWT cookie, " +
    "and redirect to the request URL with only the JWT removed from within the query string", (done) => {
    const token = "eyJhbG.eyJzdW.4pcPyM";
    const req = httpMocks.createRequest({
      method: "GET",
      url: "/ccd/documents?documentType=default&jwt=" + token + "&documentName=caseDetails",
    });
    const res = buildResponse();
    const next = () => {
      // empty body intended
    };

    res.on("end", () => {
      expect(res.cookies).to.have.property(jwt);
      const cookie = res.cookies[jwt];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.equal(true);
      expect(cookie.options.secure).to.equal(true);
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal("/ccd/documents?documentType=default&documentName=caseDetails");
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });
});
