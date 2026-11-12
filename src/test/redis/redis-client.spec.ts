import { expect } from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";
import { Redis } from "ioredis";

describe("redis-client", () => {

    const PROPERTY_REDIS_ENABLED: string = "redis.enabled";
    const PROPERTY_REDIS_HOST: string = "redis.host";
    const PROPERTY_REDIS_PORT: string = "redis.port";

    const REDIS_HOST: string = "dummyHost";
    const REDIS_PORT: number = 9999;

    let configGetStub: sinon.SinonStub;

    let redisClientStub: sinon.SinonStub;
    let redisClientOnStub: sinon.SinonStub;

    let redisClientDef: any;

    beforeEach(() => {
        configGetStub = sinon.stub();

        redisClientStub = sinon.stub();
        redisClientOnStub = sinon.stub();

        redisClientOnStub.returnsThis();

        redisClientDef = proxyquire("../../main/redis/redis-client", {
            config: { get: configGetStub },
            ioredis: {
                Redis : redisClientStub.callsFake(() => {
                    return {
                        on : redisClientOnStub,
                    };
                }),
            },
        });
    });

    it("Should return null when Redis not enabled", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(false);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.false;
    });

    it("Should return RedisClient when Redis is enabled", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
    });

    it.skip("Should return existing RedisClient", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);

        const redisClientOne: Redis | null = redisClientDef.getRedisClient();
        expect(redisClientOne).to.not.be.null;

        const redisClientTwo: Redis | null = redisClientDef.getRedisClient();
        expect(redisClientTwo).to.not.be.null;

        expect(configGetStub.callCount).to.equal(4);
        expect(configGetStub.getCall(0).args[0]).to.equal(PROPERTY_REDIS_ENABLED);
        expect(configGetStub.getCall(1).args[0]).to.equal(PROPERTY_REDIS_HOST);
        expect(configGetStub.getCall(2).args[0]).to.equal(PROPERTY_REDIS_PORT);
        expect(configGetStub.getCall(3).args[0]).to.equal(PROPERTY_REDIS_ENABLED);
    });
});
