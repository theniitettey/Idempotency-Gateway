type StoredResponse = {
    statusCode: number;
    body: any;
}

type Status = "IN_PROGRESS" | "COMPLETED"

type Entry = {
    requestHash: string;
    status: Status;
    response: StoredResponse;

    // in-flight support
    promise: Promise<StoredResponse>
    resolve: (val: StoredResponse) => void;
    reject: (err: any) => void;

    // timestamps
    createdAt: Date;
    // TTL for entries
    expiresAt: Date;
}

export type {StoredResponse, Status, Entry}
