import { Entry, StoredResponse } from "../interfaces";
import CONFIG from "../config";

class IdempotencyStore {
    private store: Map<string, Entry> = new Map();
    private readonly ttlMs: number;

    constructor(ttlSeconds = CONFIG.IDEMPOTENCY_TTL_SECONDS) {
        this.ttlMs = ttlSeconds * 1000;
        this.cleanupExpiredEntries();
    }

    private cleanupExpiredEntries() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.store.entries()) {
                if (entry.expiresAt.getTime() < now) {
                    this.store.delete(key);
                }
            }
        }, this.ttlMs).unref();
    }

    get(key: string): Entry | undefined {
        const entry = this.store.get(key)
        if (!entry) return undefined
        if (entry.expiresAt.getTime() < Date.now()) {
            this.store.delete(key)
            return undefined
        }
        return entry
    }

    createInProgress(key: string, requestHash: string) {
        let resolve!: (value: StoredResponse) => void;
        let reject!: (reason?: any) => void;

        const wrappedPromise = new Promise<StoredResponse>((res, rej) => {
            resolve = res;
            reject = rej;
        })

        const now = Date.now()
        const entry: Entry = {
            requestHash,
            status: "IN_PROGRESS",
            promise: wrappedPromise,
            resolve,
            reject,
            createdAt: new Date(now),
            expiresAt: new Date(now + this.ttlMs)
        }

        this.store.set(key, entry)
        return entry
    }

    complete(key: string, response: StoredResponse) {
        const entry = this.store.get(key)
        if (!entry) return

        entry.status = "COMPLETED"
        entry.response = response
        entry.resolve(response)
    }

    fail(key: string, error: any) {
        const entry = this.store.get(key)
        if (!entry) return

        entry.status = "COMPLETED"
        entry.reject(error)
    }
}

const idempotencyStore = new IdempotencyStore()

export { idempotencyStore }
