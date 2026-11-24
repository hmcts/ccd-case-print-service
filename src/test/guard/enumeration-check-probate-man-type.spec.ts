import { expect } from "chai";
import proxyquire from "proxyquire";
import * as sinon from "sinon";
import { EnumerationAttemptError } from "../../main/guard/enumeration-attempt-error";

describe("Enumeration check probateManType", () => {

    const PROPERTY_ENUMERATION_CHECK_ENABLED: string = "guard.enumerationCheck.enabled";
    const PROPERTY_ENUMERATION_CHECK_LIMIT: string = "guard.enumerationCheck.limit";
    const PROPERTY_ENUMERATION_CHECK_TTL: string = "guard.enumerationCheck.ttl";

    const ENUMERATION_LIMIT: number = 10;
    const ENUMERATION_LIMIT_DEFAULT: number = 1;
    const ENUMERATION_TTL: number = 60;

    const USER_ID: string = "testUserId";
    const CASE_TYPE_CAVEAT: string = "CAVEAT";
    const CASE_ID: number = 100;

    const CACHE_KEY_CAVEAT: string = "probate-man-type:testUserId:CAVEAT";

    let storeGetStub: sinon.SinonStub;
    let storeSetStub: sinon.SinonStub;

    let configGetOrDefaultStub: sinon.SinonStub;

    let enumerationCheckProbateManType: any;

    describe("checkForEnumerationAttempt tests", () => {

        beforeEach("checkForEnumerationAttempt tests setup", () => {
            storeGetStub = sinon.stub();
            storeSetStub = sinon.stub();

            configGetOrDefaultStub = sinon.stub();
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT).returns(ENUMERATION_LIMIT);
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_TTL).returns(ENUMERATION_TTL);

            enumerationCheckProbateManType = proxyquire("../../main/guard/enumeration-check-probate-man-type", {
                "../store/case-id-store": {
                    get: storeGetStub,
                    set: storeSetStub
                },
                "../util/config": { getOrDefault : configGetOrDefaultStub }
            });
        });

        it("Should not perform enumeration check if enumeration check not enabled", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(false);

            const result = await enumerationCheckProbateManType
                .checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.false;
        });

        it("Should add case id to cache if no previous entry in cache", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves(null);
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType
                .checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.false;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, ENUMERATION_TTL)).to.be.true;
        });

        it("Should update cache if previous entry in cache > limit (positive)", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("89");
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType
                .checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, ENUMERATION_TTL)).to.be.true;
        });

        it("Should update cache if previous entry in cache > limit (negative)", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("111");
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType
                .checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, ENUMERATION_TTL)).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache < limit (positive)", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("91");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache < limit (negative)", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("109");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache = limit (positive)", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("90");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache = limit (negative)", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("110");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache if previous entry in cache is the same", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves(CASE_ID);

            const result = await enumerationCheckProbateManType
                .checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.false;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

    });

    describe("config property tests", () => {

        beforeEach("config property tests setup", () => {
            storeGetStub = sinon.stub();
            storeSetStub = sinon.stub();

            configGetOrDefaultStub = sinon.stub();

            enumerationCheckProbateManType = proxyquire("../../main/guard/enumeration-check-probate-man-type", {
                "../store/case-id-store": {
                    get: storeGetStub,
                    set: storeSetStub
                },
                "../util/config": { getOrDefault: configGetOrDefaultStub }
            });
        });

        it("Should use false when enumeration check enabled property exists but has no value", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(null);

            const result = await enumerationCheckProbateManType
                .checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.false;
        });

        it("Should use default value when there is no enumeration limit property", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("101");
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT)
                .returns(ENUMERATION_LIMIT_DEFAULT);

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should use default value when enumeration limit property exists but has no value", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves("101");
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT).returns(null);

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should use null TTL", async () => {
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED, false).returns(true);
            storeGetStub.resolves(null);
            configGetOrDefaultStub.withArgs(PROPERTY_ENUMERATION_CHECK_TTL, null).returns(null);
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType
                .checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED, false)).to.be.true;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT, ENUMERATION_LIMIT_DEFAULT))
                .to.be.false;
            expect(configGetOrDefaultStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL, null)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, null)).to.be.true;
        });
    });

    function assertEnumerationAttemptError(error: EnumerationAttemptError) {
        expect(error.message).to.equal("ENUMERATION ATTEMPT");
        expect(error.code).to.equal("ENUMERATION_ATTEMPT");
        expect(error.error).to.equal("Not Found");
        expect(error.status).to.equal(404);
    }
});
