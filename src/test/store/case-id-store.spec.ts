import * as chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

chai.use(chaiAsPromised);

describe("case-store-id", () => {

    const PROPERTY_REDIS_ENABLED : string = "redis.enabled";

    const STORE_KEY : string = "test-key";
    const CASE_ID_1 : number = 123;
    const CASE_ID_2 : number = 456;

    const TTL_ONE_SECOND : number = 1;

    let configGetStub : sinon.SinonStub;

    let redisClientStub : sinon.SinonStub;
    let redisClientOnStub : sinon.SinonStub;
    let redisClientGetStub : sinon.SinonStub;
    let redisClientSetStub : sinon.SinonStub;

    let caseIdStore : any;

    describe("Memory store tests", () => {

        beforeEach(() => {
            configGetStub = sinon.stub();
            configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(false);

            redisClientStub = sinon.stub();
            redisClientGetStub = sinon.stub();
            redisClientSetStub = sinon.stub();
            redisClientOnStub = sinon.stub();

            caseIdStore = proxyquire("../../main/store/case-id-store", {
                "config" : { get : configGetStub },
                "ioredis" : {
                    "Redis" : redisClientStub.callsFake(() => {
                        return {
                            on : redisClientOnStub,
                            get : redisClientGetStub,
                            set : redisClientSetStub
                        }
                    })
                }
            });
        });

        it("Should return null when key does not exist", async () => {
            const result : Promise<string | null> = caseIdStore.get(STORE_KEY);

            expect(result).to.eventually.be.null;

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientGetStub.notCalled).to.be.true;
        });

        it("Should store and return value", async () => {
            const setResult : Promise<string> = caseIdStore.set(STORE_KEY, CASE_ID_1, null);
            expect(setResult).to.eventually.equal("OK");

            const getResult : Promise<string | null> = caseIdStore.get(STORE_KEY);
            expect(getResult).to.eventually.equal(CASE_ID_1.toString());

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientSetStub.notCalled).to.be.true;
            expect(redisClientGetStub.notCalled).to.be.true;
        });

        it("Should return value when TTL has not expired", async () => {
            const setResult : Promise<string> = caseIdStore.set(STORE_KEY, CASE_ID_1, TTL_ONE_SECOND);
            expect(setResult).to.eventually.equal("OK");

            const getResult : Promise<string | null> = caseIdStore.get(STORE_KEY);
            expect(getResult).to.eventually.equal(CASE_ID_1.toString());

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientSetStub.notCalled).to.be.true;
            expect(redisClientGetStub.notCalled).to.be.true;
        });

        // Can't find typescript friendly way of overriding Mocha's default 2 second timeout for this test
        it("Should return null when TTL has expired", async () => {
            const setResult : Promise<string> = caseIdStore.set(STORE_KEY, CASE_ID_1, TTL_ONE_SECOND);
            expect(setResult).to.eventually.equal("OK");

            const getResult : Promise<string | null> = caseIdStore.get(STORE_KEY);
            expect(getResult).to.eventually.equal(CASE_ID_1.toString());

            await new Promise((resolve) => setTimeout(resolve, 1500));

            const getResultExpired : Promise<string | null> = caseIdStore.get(STORE_KEY);
            expect(getResultExpired).to.eventually.be.null;

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientSetStub.notCalled).to.be.true;
            expect(redisClientGetStub.notCalled).to.be.true;
        });

        it("Should update value", async () => {
            const setResult : Promise<string> = caseIdStore.set(STORE_KEY, CASE_ID_1, null);
            expect(setResult).to.eventually.equal("OK");

            const setResultUpdated : Promise<string> = caseIdStore.set(STORE_KEY, CASE_ID_2, null);
            expect(setResultUpdated).to.eventually.equal("OK");

            const getResult : Promise<string | null> = caseIdStore.get(STORE_KEY);
            expect(getResult).to.eventually.equal(CASE_ID_2.toString());

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientSetStub.notCalled).to.be.true;
            expect(redisClientGetStub.notCalled).to.be.true;
        })
    });

    describe("Redis store tests", () => {

        beforeEach(() => {
            configGetStub = sinon.stub();
            configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);

            redisClientStub = sinon.stub();
            redisClientGetStub = sinon.stub();
            redisClientSetStub = sinon.stub();
            redisClientOnStub = sinon.stub();

            redisClientOnStub.returnsThis();

            caseIdStore = proxyquire("../../main/store/case-id-store", {
                "config" : { get : configGetStub },
                "ioredis" : {
                    "Redis" : redisClientStub.callsFake(() => {
                        return {
                            on : redisClientOnStub,
                            get : redisClientGetStub,
                            set : redisClientSetStub
                        }
                    })
                }
            });
        });

        it("Should call get", async () => {
            redisClientGetStub.withArgs(STORE_KEY).resolves(null);

            const result : Promise<string | null> = caseIdStore.get(STORE_KEY);
            expect(result).to.eventually.be.null;

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientGetStub.calledWith(STORE_KEY)).to.be.true;
        });

        it("Should call set without TTL", async () => {
            redisClientSetStub.withArgs(STORE_KEY, CASE_ID_1).resolves("OK");

            const result : Promise<string> = caseIdStore.set(STORE_KEY, CASE_ID_1, null);
            expect(result).to.eventually.equal("OK");

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientSetStub.calledWith(STORE_KEY, CASE_ID_1)).to.be.true;
        })

        it("Should call set with TTL", async () => {
            redisClientSetStub.withArgs(STORE_KEY, CASE_ID_1, "EX", TTL_ONE_SECOND).resolves("OK");

            const result : Promise<string> = caseIdStore.set(STORE_KEY, CASE_ID_1, TTL_ONE_SECOND);
            expect(result).to.eventually.equal("OK");

            expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
            expect(redisClientSetStub.calledWith(STORE_KEY, CASE_ID_1, "EX", TTL_ONE_SECOND)).to.be.true;
        })
    });

});
