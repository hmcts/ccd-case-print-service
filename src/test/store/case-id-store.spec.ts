import * as chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

chai.use(chaiAsPromised);

describe("case-store-id", () => {

    const PROPERTY_REDIS_ENABLED: string = "redis.enabled";
    const PROPERTY_REDIS_HOST = "redis.host";
    const PROPERTY_REDIS_PORT = "redis.port";

    const REDIS_HOST: string = "dummyHost";
    const REDIS_PORT: number = 9999;

    const STORE_KEY: string = "test-key";
    const CASE_ID: number = 123;

    let configGetStub: sinon.SinonStub;

    let memoryStoreStub: sinon.SinonStub;
    let memoryStoreGetStub: sinon.SinonStub;
    let memoryStoreSetStub: sinon.SinonStub;

    let redisStoreStub: sinon.SinonStub;
    let redisStoreGetStub: sinon.SinonStub;
    let redisStoreSetStub: sinon.SinonStub;

    let caseIdStore: any;

    beforeEach(() => {
        configGetStub = sinon.stub();

        memoryStoreStub = sinon.stub();
        memoryStoreGetStub = sinon.stub();
        memoryStoreSetStub = sinon.stub();

        redisStoreStub = sinon.stub();
        redisStoreGetStub = sinon.stub();
        redisStoreSetStub = sinon.stub();

        caseIdStore = proxyquire("../../main/store/case-id-store", {
            "./memory-store" : {
                MemoryStore : memoryStoreStub.callsFake(() => {
                    return {
                        get : memoryStoreGetStub,
                        set : memoryStoreSetStub,
                    };
                }),
            },
            "./redis-store" : {
                RedisStore : redisStoreStub.callsFake(() => {
                    return {
                        get : redisStoreGetStub,
                        set : redisStoreSetStub,
                    };
                }),
            },
            "config" : { get : configGetStub },
        });
    });

    it("Should use memory store when redis disabled (get value)", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(false);

        memoryStoreGetStub.withArgs(STORE_KEY).resolves(null);

        const result: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(result).to.eventually.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.false;

        expect(memoryStoreGetStub.calledWith(STORE_KEY)).to.be.true;
        expect(redisStoreGetStub.calledWith(STORE_KEY)).to.be.false;
    });

    it("Should use memory store when redis disabled (set value)", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(false);

        memoryStoreSetStub.withArgs(STORE_KEY, CASE_ID, null).resolves("OK");

        const result: Promise<string | null> = caseIdStore.set(STORE_KEY, CASE_ID, null);
        expect(result).to.eventually.equal("OK");

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.false;

        expect(memoryStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.true;
        expect(redisStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.false;
    });

    it("Should use redis store when redis enabled (get value)", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);

        redisStoreGetStub.withArgs(STORE_KEY).resolves(null);

        const result: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(result).to.eventually.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;

        expect(memoryStoreGetStub.calledWith(STORE_KEY)).to.be.false;
        expect(redisStoreGetStub.calledWith(STORE_KEY)).to.be.true;
    });

    it("Should use redis store when redis enabled (set value)", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);

        redisStoreSetStub.withArgs(STORE_KEY, CASE_ID, null).resolves("OK");

        const result: Promise<string | null> = caseIdStore.set(STORE_KEY, CASE_ID, null);
        expect(result).to.eventually.equal("OK");

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;

        expect(memoryStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.false;
        expect(redisStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.true;
    });

    it("Should only initialise store once", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);

        redisStoreGetStub.withArgs(STORE_KEY).resolves(null);

        const resultGetOne: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(resultGetOne).to.eventually.be.null;

        const resultGetTwo: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(resultGetTwo).to.eventually.be.null;

        expect(configGetStub.callCount).to.equal(3);
        expect(configGetStub.getCall(0).args[0]).to.equal(PROPERTY_REDIS_ENABLED);
        expect(configGetStub.getCall(1).args[0]).to.equal(PROPERTY_REDIS_HOST);
        expect(configGetStub.getCall(2).args[0]).to.equal(PROPERTY_REDIS_PORT);

        expect(memoryStoreGetStub.calledWith(STORE_KEY)).to.be.false;
        expect(redisStoreGetStub.calledWith(STORE_KEY)).to.be.true;
    });
});
