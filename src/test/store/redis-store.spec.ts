import * as chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import { RedisStore } from "store/redis-store";

chai.use(chaiAsPromised);

describe("redis-store", () => {

    const REDIS_HOST: string = "dummyHost";
    const REDIS_PORT: number = 9999;

    const STORE_KEY: string = "test-key";
    const CASE_ID: number = 123;
    const TTL_ONE_SECOND: number = 1;

    let redisClientStub: sinon.SinonStub;
    let redisClientOnStub: sinon.SinonStub;
    let redisClientGetStub: sinon.SinonStub;
    let redisClientSetStub: sinon.SinonStub;

    let redisStoreDef: any;
    let redisStore: RedisStore;

    beforeEach(() => {

        redisClientStub = sinon.stub();
        redisClientGetStub = sinon.stub();
        redisClientSetStub = sinon.stub();
        redisClientOnStub = sinon.stub();

        redisClientOnStub.returnsThis();

        redisStoreDef = proxyquire("../../main/store/redis-store", {
            ioredis : {
                Redis : redisClientStub.callsFake(() => {
                    return {
                        get : redisClientGetStub,
                        on : redisClientOnStub,
                        set : redisClientSetStub,
                    };
                }),
            },
        });

        redisStore = new redisStoreDef.RedisStore(REDIS_HOST, REDIS_PORT);
    });

    it("Should call Redis get method", async () => {
        redisClientGetStub.withArgs(STORE_KEY).resolves(null);

        const result: Promise<string | null> = redisStore.get(STORE_KEY);
        expect(result).to.eventually.be.null;

        expect(redisClientGetStub.calledWith(STORE_KEY)).to.be.true;
    });

    it("Should call Redis set method without TTL", async () => {
        redisClientSetStub.withArgs(STORE_KEY, CASE_ID).resolves("OK");

        const result: Promise<string> = redisStore.set(STORE_KEY, CASE_ID, null);
        expect(result).to.eventually.equal("OK");

        expect(redisClientSetStub.calledWith(STORE_KEY, CASE_ID)).to.be.true;
    });

    it("Should call Redis set method with TTL", async () => {
        redisClientSetStub.withArgs(STORE_KEY, CASE_ID, "EX", TTL_ONE_SECOND).resolves("OK");

        const result: Promise<string> = redisStore.set(STORE_KEY, CASE_ID, TTL_ONE_SECOND);
        expect(result).to.eventually.equal("OK");

        expect(redisClientSetStub.calledWith(STORE_KEY, CASE_ID, "EX", TTL_ONE_SECOND)).to.be.true;
    });
});
