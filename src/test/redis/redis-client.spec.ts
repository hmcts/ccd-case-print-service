import { expect } from "chai";
import proxyquire from "proxyquire";
import * as sinon from "sinon";
import { Redis } from "ioredis";
import { ConnectionOptions } from "tls";

describe("redis-client", () => {

    const PROPERTY_REDIS_ENABLED: string = "redis.enabled";
    const PROPERTY_REDIS_HOST: string = "secrets.ccd.case-print-service-managed-redis-host";
    const PROPERTY_REDIS_PORT: string = "secrets.ccd.case-print-service-managed-redis-port";
    const PROPERTY_REDIS_KEY: string = "secrets.ccd.case-print-service-managed-redis-primary-access-key";
    const PROPERTY_REDIS_TLS_ENABLED: string = "redis.tlsEnabled";

    const REDIS_HOST: string = "dummyHost";
    const REDIS_PORT: number = 9999;
    const REDIS_KEY: string = "dummyKey";
    const REDIS_KEY_NONE: undefined = undefined;
    const REDIS_TLS_SETTINGS: ConnectionOptions = {};
    const REDIS_TLS_SETTINGS_NONE: undefined = undefined;

    let configGetOrDefaultStub: sinon.SinonStub;
    let configGetOrThrowStub: sinon.SinonStub;

    let redisClientStub: sinon.SinonStub;
    let redisClientOnStub: sinon.SinonStub;

    let redisClientDef: any;

    beforeEach(() => {
        configGetOrDefaultStub = sinon.stub();
        configGetOrThrowStub = sinon.stub();

        redisClientStub = sinon.stub();
        redisClientOnStub = sinon.stub();

        redisClientOnStub.returnsThis();

        redisClientDef = proxyquire("../../main/redis/redis-client", {
            "../util/config": {
                getOrDefault: configGetOrDefaultStub,
                getOrThrow: configGetOrThrowStub
            },
            ioredis: {
                Redis: redisClientStub.callsFake(() => {
                    return {
                        on: redisClientOnStub
                    };
                })
            }
        });
    });

    it("Should return null when Redis enabled property has no value", async () => {
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_ENABLED, false).returns(null);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.be.null;

        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_ENABLED, false)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_HOST)).to.be.false;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_KEY)).to.be.false;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_PORT)).to.be.false;
        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_TLS_ENABLED, false)).to.be.false;
    });

    it("Should return null when Redis not enabled", async () => {
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_ENABLED, false).returns(false);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.be.null;

        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_ENABLED, false)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_HOST)).to.be.false;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_KEY)).to.be.false;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_PORT)).to.be.false;
        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_TLS_ENABLED, false)).to.be.false;
    });

    it("Should return RedisClient when Redis is enabled", async () => {
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_ENABLED, false).returns(true);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_TLS_ENABLED, false).returns(false);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_ENABLED, false)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_TLS_ENABLED, false)).to.be.true;

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY_NONE, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should return existing RedisClient", async () => {
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_ENABLED, false).returns(true);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_TLS_ENABLED, false).returns(false);

        const redisClientOne: Redis | null = redisClientDef.getRedisClient();
        expect(redisClientOne).to.not.be.null;

        const redisClientTwo: Redis | null = redisClientDef.getRedisClient();
        expect(redisClientTwo).to.not.be.null;

        expect(configGetOrDefaultStub.callCount).to.equal(3);
        expect(configGetOrDefaultStub.getCall(0).args[0]).to.equal(PROPERTY_REDIS_ENABLED);
        expect(configGetOrDefaultStub.getCall(1).args[0]).to.equal(PROPERTY_REDIS_TLS_ENABLED);
        expect(configGetOrDefaultStub.getCall(2).args[0]).to.equal(PROPERTY_REDIS_ENABLED);

        expect(configGetOrThrowStub.callCount).to.equal(3);
        expect(configGetOrThrowStub.getCall(0).args[0]).to.equal(PROPERTY_REDIS_HOST);
        expect(configGetOrThrowStub.getCall(1).args[0]).to.equal(PROPERTY_REDIS_KEY);
        expect(configGetOrThrowStub.getCall(2).args[0]).to.equal(PROPERTY_REDIS_PORT);

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY_NONE, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should create RedisClient with key if one specified", async () => {
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_ENABLED, false).returns(true);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_KEY).returns(REDIS_KEY);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_TLS_ENABLED, false).returns(false);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_ENABLED, false)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_TLS_ENABLED, false)).to.be.true;

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should create RedisClient with no TLS settings if TLS enabled property has no value", async () => {
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_ENABLED, false).returns(true);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_TLS_ENABLED, false).returns(null);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_ENABLED, false)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_TLS_ENABLED, false)).to.be.true;

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY_NONE, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should create RedisClient with TLS settings if TLS enabled", async () => {
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_ENABLED, false).returns(true);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetOrThrowStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetOrDefaultStub.withArgs(PROPERTY_REDIS_TLS_ENABLED, false).returns(true);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_ENABLED, false)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetOrThrowStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetOrDefaultStub.calledWith(PROPERTY_REDIS_TLS_ENABLED, false)).to.be.true;

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY_NONE, REDIS_TLS_SETTINGS);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    function getExpectedRedisConnectionDetails(expectedKey: string | undefined,
                                               expectedTlsSettings: ConnectionOptions | undefined): any {
        return {
            host: REDIS_HOST,
            password: expectedKey,
            port: REDIS_PORT,
            tls: expectedTlsSettings
        };
    }
});
