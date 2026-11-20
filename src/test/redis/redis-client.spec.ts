import { expect } from "chai";
import * as proxyquire from "proxyquire";
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
                        on : redisClientOnStub
                    };
                })
            }
        });
    });

    it("Should return null when Redis enabled property has no value", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(null);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_KEY)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_TLS_ENABLED)).to.be.false;
    });

    it("Should return null when Redis not enabled", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(false);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_KEY)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.false;
        expect(configGetStub.calledWith(PROPERTY_REDIS_TLS_ENABLED)).to.be.false;
    });

    it("Should return RedisClient when Redis is enabled", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetStub.withArgs(PROPERTY_REDIS_TLS_ENABLED).returns(false);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_TLS_ENABLED)).to.be.true;

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY_NONE, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should return existing RedisClient", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetStub.withArgs(PROPERTY_REDIS_TLS_ENABLED).returns(false);

        const redisClientOne: Redis | null = redisClientDef.getRedisClient();
        expect(redisClientOne).to.not.be.null;

        const redisClientTwo: Redis | null = redisClientDef.getRedisClient();
        expect(redisClientTwo).to.not.be.null;

        expect(configGetStub.callCount).to.equal(6);
        expect(configGetStub.getCall(0).args[0]).to.equal(PROPERTY_REDIS_ENABLED);
        expect(configGetStub.getCall(1).args[0]).to.equal(PROPERTY_REDIS_HOST);
        expect(configGetStub.getCall(2).args[0]).to.equal(PROPERTY_REDIS_KEY);
        expect(configGetStub.getCall(3).args[0]).to.equal(PROPERTY_REDIS_PORT);
        expect(configGetStub.getCall(4).args[0]).to.equal(PROPERTY_REDIS_TLS_ENABLED);
        expect(configGetStub.getCall(5).args[0]).to.equal(PROPERTY_REDIS_ENABLED);

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY_NONE, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should create RedisClient with key if one specified", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_KEY).returns(REDIS_KEY);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetStub.withArgs(PROPERTY_REDIS_TLS_ENABLED).returns(false);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_TLS_ENABLED)).to.be.true;

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should create RedisClient with no TLS settings if TLS enabled property has no value", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetStub.withArgs(PROPERTY_REDIS_TLS_ENABLED).returns(null);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_TLS_ENABLED)).to.be.true;

        const expectedConnectionDetails = getExpectedRedisConnectionDetails(REDIS_KEY_NONE, REDIS_TLS_SETTINGS_NONE);
        expect(redisClientStub.calledOnceWith(expectedConnectionDetails)).to.be.true;
    });

    it("Should create RedisClient with TLS settings if TLS enabled", async () => {
        configGetStub.withArgs(PROPERTY_REDIS_ENABLED).returns(true);
        configGetStub.withArgs(PROPERTY_REDIS_HOST).returns(REDIS_HOST);
        configGetStub.withArgs(PROPERTY_REDIS_KEY).returns(null);
        configGetStub.withArgs(PROPERTY_REDIS_PORT).returns(REDIS_PORT);
        configGetStub.withArgs(PROPERTY_REDIS_TLS_ENABLED).returns(true);

        const redisClient: Redis | null = redisClientDef.getRedisClient();
        expect(redisClient).to.not.be.null;

        expect(configGetStub.calledWith(PROPERTY_REDIS_ENABLED)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_HOST)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_KEY)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_PORT)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_REDIS_TLS_ENABLED)).to.be.true;

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
