import * as chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

chai.use(chaiAsPromised);

describe("case-store-id", () => {

    const STORE_KEY: string = "test-key";
    const CASE_ID: number = 123;

    let getRedisClientStub: sinon.SinonStub;
    let redisClientStub: sinon.SinonStub;

    let memoryStoreStub: sinon.SinonStub;
    let memoryStoreGetStub: sinon.SinonStub;
    let memoryStoreSetStub: sinon.SinonStub;

    let redisStoreStub: sinon.SinonStub;
    let redisStoreGetStub: sinon.SinonStub;
    let redisStoreSetStub: sinon.SinonStub;

    let caseIdStore: any;

    beforeEach(() => {

        getRedisClientStub = sinon.stub();
        redisClientStub = sinon.stub();

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
            "redis/redis-client": { getRedisClient : getRedisClientStub },
        });
    });

    it("Should use memory store when redis disabled (get value)", async () => {
        getRedisClientStub.returns(null);

        memoryStoreGetStub.withArgs(STORE_KEY).resolves(null);

        const result: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(result).to.eventually.be.null;

        expect(getRedisClientStub.calledOnce).to.be.true;

        expect(memoryStoreGetStub.calledWith(STORE_KEY)).to.be.true;
        expect(redisStoreGetStub.calledWith(STORE_KEY)).to.be.false;
    });

    it("Should use memory store when redis disabled (set value)", async () => {
        getRedisClientStub.returns(null);

        memoryStoreSetStub.withArgs(STORE_KEY, CASE_ID, null).resolves("OK");

        const result: Promise<string | null> = caseIdStore.set(STORE_KEY, CASE_ID, null);
        expect(result).to.eventually.equal("OK");

        expect(getRedisClientStub.calledOnce).to.be.true;

        expect(memoryStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.true;
        expect(redisStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.false;
    });

    it("Should use redis store when redis enabled (get value)", async () => {
        getRedisClientStub.returns(redisClientStub);

        redisStoreGetStub.withArgs(STORE_KEY).resolves(null);

        const result: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(result).to.eventually.be.null;

        expect(getRedisClientStub.calledOnce).to.be.true;
        expect(redisStoreStub.calledWith(redisClientStub)).to.be.true;

        expect(memoryStoreGetStub.calledWith(STORE_KEY)).to.be.false;
        expect(redisStoreGetStub.calledWith(STORE_KEY)).to.be.true;
    });

    it("Should use redis store when redis enabled (set value)", async () => {
        getRedisClientStub.returns(redisClientStub);

        redisStoreSetStub.withArgs(STORE_KEY, CASE_ID, null).resolves("OK");

        const result: Promise<string | null> = caseIdStore.set(STORE_KEY, CASE_ID, null);
        expect(result).to.eventually.equal("OK");

        expect(getRedisClientStub.calledOnce).to.be.true;
        expect(redisStoreStub.calledWith(redisClientStub)).to.be.true;

        expect(memoryStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.false;
        expect(redisStoreSetStub.calledWith(STORE_KEY, CASE_ID, null)).to.be.true;
    });

    it("Should only initialise store once", async () => {
        getRedisClientStub.returns(redisClientStub);

        redisStoreGetStub.withArgs(STORE_KEY).resolves(null);

        const resultGetOne: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(resultGetOne).to.eventually.be.null;

        const resultGetTwo: Promise<string | null> = caseIdStore.get(STORE_KEY);
        expect(resultGetTwo).to.eventually.be.null;

        expect(getRedisClientStub.calledOnce).to.be.true;
        expect(redisStoreStub.calledWith(redisClientStub)).to.be.true;

        expect(memoryStoreGetStub.calledWith(STORE_KEY)).to.be.false;
        expect(redisStoreGetStub.calledWith(STORE_KEY)).to.be.true;
    });
});
