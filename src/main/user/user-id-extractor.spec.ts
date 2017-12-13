import { expect } from "chai";
import { IncomingMessage } from "http";
import { extract as userIdExtractor } from "./user-id-extractor";

describe('User ID extractor', () => {
  describe('extract()', () => {
    it('should extract ID from URL', () => {
      let request = Object.create(IncomingMessage.prototype);
      request.originalUrl = '/data/caseworker/5/TEST/case-types/TestAddressBookCase/cases/7';

      let userId = userIdExtractor(request);

      expect(userId).to.equal('5');
    });

    it('should return null if ID cannot be extracted from URL', () => {
      let request = Object.create(IncomingMessage.prototype);
      request.originalUrl = '/data/caseworker/';

      let userId = userIdExtractor(request);

      expect(userId).to.be.undefined;
    });
  });
});
