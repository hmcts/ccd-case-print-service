import * as chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { MemoryStore } from "store/memory-store";

chai.use(chaiAsPromised);

describe("memory-store", () => {

    const STORE_KEY: string = "test-key";
    const CASE_ID_1: number = 123;
    const CASE_ID_2: number = 456;
    const TTL_ONE_SECOND: number = 1;

    let memoryStore: MemoryStore;

    beforeEach(() => {
        memoryStore = new MemoryStore();
    });

    it("Should return null when key does not exist", async () => {
        const result: Promise<string | null> = memoryStore.get(STORE_KEY);
        expect(result).to.eventually.be.null;
    });

    it("Should store and return value", async () => {
        const setResult: Promise<string> = memoryStore.set(STORE_KEY, CASE_ID_1, null);
        expect(setResult).to.eventually.equal("OK");

        const getResult: Promise<string | null> = memoryStore.get(STORE_KEY);
        expect(getResult).to.eventually.equal(CASE_ID_1.toString());
    });

    it("Should return value when TTL has not expired", async () => {
        const setResult: Promise<string> = memoryStore.set(STORE_KEY, CASE_ID_1, TTL_ONE_SECOND);
        expect(setResult).to.eventually.equal("OK");

        const getResult: Promise<string | null> = memoryStore.get(STORE_KEY);
        expect(getResult).to.eventually.equal(CASE_ID_1.toString());
    });

    it("Should return null when TTL has expired", async () => {
        const setResult: Promise<string> = memoryStore.set(STORE_KEY, CASE_ID_1, TTL_ONE_SECOND);
        expect(setResult).to.eventually.equal("OK");

        const getResult: Promise<string | null> = memoryStore.get(STORE_KEY);
        expect(getResult).to.eventually.equal(CASE_ID_1.toString());

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const getResultExpired: Promise<string | null> = memoryStore.get(STORE_KEY);
        expect(getResultExpired).to.eventually.be.null;
    });

    it("Should update value", async () => {
        const setResult: Promise<string> = memoryStore.set(STORE_KEY, CASE_ID_1, null);
        expect(setResult).to.eventually.equal("OK");

        const setResultUpdated: Promise<string> = memoryStore.set(STORE_KEY, CASE_ID_2, null);
        expect(setResultUpdated).to.eventually.equal("OK");

        const getResult: Promise<string | null> = memoryStore.get(STORE_KEY);
        expect(getResult).to.eventually.equal(CASE_ID_2.toString());
    });
});
