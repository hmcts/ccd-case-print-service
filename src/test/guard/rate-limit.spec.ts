import { expect } from "chai";
import * as proxyquire from "proxyquire";
import * as sinon from "sinon";

describe("rate-limit", () => {
    const PROPERTY_RATE_LIMIT_WINDOW_PERIOD: string = "guard.rateLimit.windowPeriod";
    const PROPERTY_RATE_LIMIT_REQUEST_LIMIT: string = "guard.rateLimit.requestLimit";

    const WINDOW_PERIOD: number = 30;
    const REQUEST_LIMIT: number = 2;

    let configGetStub: sinon.SinonStub;
    let getRedisClientStub: sinon.SinonStub;
    let rateLimitStub: sinon.SinonStub;

    let rateLimit: any;

    beforeEach(() => {
        configGetStub = sinon.stub();
        configGetStub.withArgs(PROPERTY_RATE_LIMIT_WINDOW_PERIOD).returns(WINDOW_PERIOD);
        configGetStub.withArgs(PROPERTY_RATE_LIMIT_REQUEST_LIMIT).returns(REQUEST_LIMIT);

        getRedisClientStub = sinon.stub();
        rateLimitStub = sinon.stub();

        rateLimit = proxyquire("../../main/guard/rate-limit", {
            "config": { get: configGetStub },
            "express-rate-limit": { rateLimit: rateLimitStub },
            "redis/redis-client": { getRedisClient: getRedisClientStub },
        });
    });

    it("Should use memory store if no Redis client returned", async () => {
        getRedisClientStub.returns(null);

        rateLimit.createRateLimiter();

        expect(configGetStub.calledWith(PROPERTY_RATE_LIMIT_WINDOW_PERIOD)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_RATE_LIMIT_REQUEST_LIMIT)).to.be.true;
        expect(getRedisClientStub.calledOnce).to.be.true;

        const rateLimitConfig: any = rateLimitStub.getCall(0).args[0];
        expect(rateLimitConfig.windowMs).to.equal(30000);
        expect(rateLimitConfig.limit).to.equal(2);
        expect(rateLimitConfig.store).to.be.undefined;
    });

    it("Should use Redis store if Redis client returned", async () => {
        const redisClient: sinon.SinonStub = sinon.stub();
        getRedisClientStub.returns(redisClient);

        rateLimit.createRateLimiter();

        expect(configGetStub.calledWith(PROPERTY_RATE_LIMIT_WINDOW_PERIOD)).to.be.true;
        expect(configGetStub.calledWith(PROPERTY_RATE_LIMIT_REQUEST_LIMIT)).to.be.true;
        expect(getRedisClientStub.calledOnce).to.be.true;

        const rateLimitConfig: any = rateLimitStub.getCall(0).args[0];
        expect(rateLimitConfig.windowMs).to.equal(30000);
        expect(rateLimitConfig.limit).to.equal(2);
        expect(rateLimitConfig.store).not.to.be.undefined.and.not.to.be.null;
        expect(rateLimitConfig.store.prefix).to.be.empty;
    });
});
