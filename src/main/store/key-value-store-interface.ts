export interface IKeyValueStore {
    get(key: string): Promise<string | null>;
    set(key: string, value: number, ttl: number | null): Promise<string>;
}
