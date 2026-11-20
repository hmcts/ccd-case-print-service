import * as chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { instance, mock, verify, when } from "ts-mockito";
import { Redis } from "ioredis";
import { RedisStore } from "store/redis-store";

chai.use(chaiAsPromised);

describe("redis-store", () => {

    const STORE_KEY: string = "test-key";
    const CASE_ID: number = 123;
    const TTL_ONE_SECOND: number = 1;

    let redisClientMock: Redis;
    let redisClient: Redis;

    let redisStore: RedisStore;

    beforeEach(() => {
        redisClientMock = mock(Redis);
        redisClient = instance(redisClientMock);

        redisStore = new RedisStore(redisClient);
    });

    it("Should call Redis get method", async () => {
        when(redisClientMock.get(STORE_KEY)).thenResolve(null);

        const result: Promise<string | null> = redisStore.get(STORE_KEY);
        expect(result).to.eventually.be.null;

        verify(redisClientMock.get(STORE_KEY)).once();
    });

    it("Should call Redis set method without TTL", async () => {
        when(redisClientMock.set(STORE_KEY, CASE_ID)).thenResolve("OK");

        const result: Promise<string> = redisStore.set(STORE_KEY, CASE_ID, null);
        expect(result).to.eventually.equal("OK");

        verify(redisClientMock.set(STORE_KEY, CASE_ID)).once();
    });

    it("Should call Redis set method with TTL", async () => {
        when(redisClientMock.set(STORE_KEY, CASE_ID, "EX", TTL_ONE_SECOND)).thenResolve("OK");

        const result: Promise<string> = redisStore.set(STORE_KEY, CASE_ID, TTL_ONE_SECOND);
        expect(result).to.eventually.equal("OK");

        verify(redisClientMock.set(STORE_KEY, CASE_ID, "EX", TTL_ONE_SECOND)).once();
    });

    it("Should reject when Redis set method without TTL fails", async () => {
        when(redisClientMock.set(STORE_KEY, CASE_ID)).thenReject(new Error("Redis error"));

        expect(redisStore.set(STORE_KEY, CASE_ID, null)).to.be.rejectedWith("Redis error");

        verify(redisClientMock.set(STORE_KEY, CASE_ID)).once();
    });

    it("Should reject when Redis set method with TTL fails", async () => {
        when(redisClientMock.set(STORE_KEY, CASE_ID, "EX", TTL_ONE_SECOND)).thenReject(new Error("Redis error"));

        expect(redisStore.set(STORE_KEY, CASE_ID, TTL_ONE_SECOND)).to.be.rejectedWith("Redis error");

        verify(redisClientMock.set(STORE_KEY, CASE_ID, "EX", TTL_ONE_SECOND)).once();
    });
});
