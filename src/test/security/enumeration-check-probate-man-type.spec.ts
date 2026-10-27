import { expect } from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("Enumeration check probateManType", () => {

    const PROPERTY_ENUMERATION_CHECK_ENABLED : string = "enumerationCheck.enabled";
    const PROPERTY_ENUMERATION_CHECK_LIMIT : string = "enumerationCheck.limit";
    const PROPERTY_ENUMERATION_CHECK_TTL : string = "enumerationCheck.ttl";

    const ENUMERATION_LIMIT : number = 10;
    const ENUMERATION_TTL : number = 60;

    const USER_ID : string = "testUserId";
    const CASE_TYPE_CAVEAT : string = "CAVEAT";
    const CASE_ID : number = 100;

    const CACHE_KEY_CAVEAT : string = "probate-man-type:testUserId:CAVEAT";

    let storeGetStub : sinon.SinonStub;
    let storeSetStub : sinon.SinonStub;

    let configHasStub : sinon.SinonStub;
    let configGetStub : sinon.SinonStub;

    let enumerationCheckProbateManType : any;

    describe("checkForEnumerationAttempt tests", () => {

        beforeEach("checkForEnumerationAttempt tests setup", () => {
            storeGetStub = sinon.stub();
            storeSetStub = sinon.stub();

            configHasStub = sinon.stub();
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT).returns(true);
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_TTL).returns(true);

            configGetStub = sinon.stub();
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT).returns(ENUMERATION_LIMIT);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_TTL).returns(ENUMERATION_TTL);

            enumerationCheckProbateManType = proxyquire("../../main/security/enumeration-check-probate-man-type", {
                "../store/case-id-store" : { get : storeGetStub, set : storeSetStub },
                "config" : { has : configHasStub, get : configGetStub }
            });
        });

        it("Should not perform enumeration check if enumeration check not enabled", async() => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(false);

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.false;
        });

        it("Should add case id to cache if no previous entry in cache", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves(null);
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, ENUMERATION_TTL)).to.be.true;
        });

        it("Should update cache if previous entry in cache greater than limit (positive)", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("89");
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, ENUMERATION_TTL)).to.be.true;
        });

        it("Should update cache if previous entry in cache greater than limit (negative)", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("111");
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, ENUMERATION_TTL)).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache less than limit (positive)", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("91");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache less than limit (negative)", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("109");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache equals limit (positive)", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("90");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache and throw error if previous entry in cache equals limit (negative)", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("110");

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should not update cache if previous entry in cache is the same", async () => {
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves(CASE_ID);

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

    });

    describe("config property tests", () => {

        beforeEach("config property tests setup", () => {
            storeGetStub = sinon.stub();
            storeSetStub = sinon.stub();

            configHasStub = sinon.stub();
            configGetStub = sinon.stub();

            enumerationCheckProbateManType = proxyquire("../../main/security/enumeration-check-probate-man-type", {
                "../store/case-id-store" : { get : storeGetStub, set : storeSetStub },
                "config" : { has : configHasStub, get : configGetStub }
            });
        });

        it("Should use false when there is no enumeration check enabled property", async () => {
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(false);

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.false;
        });

        it("Should use false when enumeration check enabled property exists but has no value", async () => {
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(null);

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.false;
        });

        it("Should use default value when there is no enumeration limit property", async () => {
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("101");
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT).returns(false);

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should use default value when enumeration limit property exists but has no value", async () => {
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves("101");
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT).returns(true);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_LIMIT).returns(null);

            try {
                await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            } catch (error) {
                assertEnumerationAttemptError(error);
            }

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.notCalled).to.be.true;
        });

        it("Should use null TTL when there is no enumeration TTL property", async () => {
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves(null);
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_TTL).returns(false);
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.false;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, null)).to.be.true;
        });

        it("Should use null TTL when enumeration TTL property exists but has no value", async () => {
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_ENABLED).returns(true);
            storeGetStub.resolves(null);
            configHasStub.withArgs(PROPERTY_ENUMERATION_CHECK_TTL).returns(true);
            configGetStub.withArgs(PROPERTY_ENUMERATION_CHECK_TTL).returns(null);
            storeSetStub.resolves("OK");

            const result = await enumerationCheckProbateManType.checkForEnumerationAttempt(USER_ID, CASE_TYPE_CAVEAT, CASE_ID);
            expect(result).to.equal("OK");

            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_ENABLED)).to.be.true;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_LIMIT)).to.be.false;
            expect(configHasStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;
            expect(configGetStub.calledWith(PROPERTY_ENUMERATION_CHECK_TTL)).to.be.true;

            expect(storeGetStub.calledWith(CACHE_KEY_CAVEAT)).to.be.true;
            expect(storeSetStub.calledWith(CACHE_KEY_CAVEAT, CASE_ID, null)).to.be.true;
        })
    });

    function assertEnumerationAttemptError(error) {
        expect(error.message).to.equal("ENUMERATION ATTEMPT");
        expect(error.code).to.equal("ENUMERATION_ATTEMPT");
        expect(error.error).to.equal("Not Found");
        expect(error.status).to.equal(404);
    };
});
