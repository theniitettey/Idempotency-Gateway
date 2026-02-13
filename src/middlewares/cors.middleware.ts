import cors, { CorsOptions } from "cors";
import CONFIG from "../config";

const corsOptions: CorsOptions = {
    origin: CONFIG.ALLOWED_ORIGINS,
    optionsSuccessStatus: 200
}

const corsMiddleware = cors(corsOptions)

export {corsMiddleware}
