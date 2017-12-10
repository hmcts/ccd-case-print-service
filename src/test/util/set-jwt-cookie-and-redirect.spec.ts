import { expect } from 'chai';
import { EventEmitter } from 'events';
import { setJwtCookieAndRedirect } from '../../main/util/set-jwt-cookie-and-redirect';

const httpMocks = require('node-mocks-http');

function buildResponse() {
  return httpMocks.createResponse({ eventEmitter: EventEmitter });
}

describe('set JWT from request URL as cookie and perform redirect', () => {
  it('should set a secure cookie with the JWT, and redirect to the request URL without the JWT or query string separator', (done) => {
    const token = 'eyJhbG.eyJzdW.4pcPyM';
    let req = httpMocks.createRequest({
      method: 'GET',
      url: '/ccd/documents?jwt=' + token
    });
    let res = buildResponse();
    let next = () => {};

    res.on('end', () => {
      expect(res.cookies).to.have.property('jwt');
      let cookie = res.cookies['jwt'];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.be.true;
      expect(cookie.options.secure).to.be.true;
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal('/ccd/documents');
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });

  it('should set the JWT cookie, and redirect to the request URL with only the JWT removed from the query string start', (done) => {
    const token = 'eyJhbG.eyJzdW.4pcPyM';
    let req = httpMocks.createRequest({
      method: 'GET',
      url: '/ccd/documents?jwt=' + token + '&documentType=default'
    });
    let res = buildResponse();
    let next = () => {};

    res.on('end', () => {
      expect(res.cookies).to.have.property('jwt');
      let cookie = res.cookies['jwt'];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.be.true;
      expect(cookie.options.secure).to.be.true;
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal('/ccd/documents?documentType=default');
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });

  it('should set the JWT cookie, and redirect to the request URL with only the JWT removed from the query string end', (done) => {
    const token = 'eyJhbG.eyJzdW.4pcPyM';
    let req = httpMocks.createRequest({
      method: 'GET',
      url: '/ccd/documents?documentType=default&jwt=' + token
    });
    let res = buildResponse();
    let next = () => {};

    res.on('end', () => {
      expect(res.cookies).to.have.property('jwt');
      let cookie = res.cookies['jwt'];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.be.true;
      expect(cookie.options.secure).to.be.true;
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal('/ccd/documents?documentType=default');
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });

  it('should set the JWT cookie, and redirect to the request URL with only the JWT removed from within the query string', (done) => {
    const token = 'eyJhbG.eyJzdW.4pcPyM';
    let req = httpMocks.createRequest({
      method: 'GET',
      url: '/ccd/documents?documentType=default&jwt=' + token + '&documentName=caseDetails'
    });
    let res = buildResponse();
    let next = () => {};

    res.on('end', () => {
      expect(res.cookies).to.have.property('jwt');
      let cookie = res.cookies['jwt'];
      expect(cookie.value).to.equal(token);
      expect(cookie.options.httpOnly).to.be.true;
      expect(cookie.options.secure).to.be.true;
      expect(res._getStatusCode()).to.equal(303);
      expect(res._getRedirectUrl()).to.equal('/ccd/documents?documentType=default&documentName=caseDetails');
      done();
    });

    setJwtCookieAndRedirect(req, res, next);
  });
});
