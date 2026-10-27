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

    let configGetStub: sinon.SinonStub;

    let memoryStoreStub: sinon.SinonStub;
    let memoryStoreGetStub: sinon.SinonStub;

    let redisStoreStub: sinon.SinonStub;
    let redisStoreGetStub: sinon.SinonStub;

    let caseIdStore: any;

    beforeEach(() => {
        configGetStub = sinon.stub();

        memoryStoreStub = sinon.stub();
        memoryStoreGetStub = sinon.stub();

        redisStoreStub = sinon.stub();
        redisStoreGetStub = sinon.stub();

        caseIdStore = proxyquire("../../main/store/case-id-store", {
            "./memory-store" : {
                MemoryStore : memoryStoreStub.callsFake(() => {
                    return {
                        get : memoryStoreGetStub,
                    };
                }),
            },
            "./redis-store" : {
                RedisStore : redisStoreStub.callsFake(() => {
                    return {
                        get : redisStoreGetStub,
                    };
                }),
            },
            "config" : { get : configGetStub },
        });
    });

    it("Should use memory store when redis disabled", async () => {
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

    it("Should use redis store when redis enabled", async () => {
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
});
