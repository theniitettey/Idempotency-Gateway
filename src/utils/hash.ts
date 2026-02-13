import crypto from "crypto"
import { normalizeResponse } from "./normalizeResponses"

const hashBody = (body: unknown): string => {
    const normalizedBody = normalizeResponse(body)

    return crypto.createHash("sha256").update(normalizedBody).digest("hex")
}

export {hashBody}