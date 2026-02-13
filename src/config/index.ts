import dotenv from "dotenv";
dotenv.config();

const CONFIG = {
    PORT: process.env.PORT || 3000,
    ENV: process.env.NODE_ENV || "development",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || "*",
}

const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

export default CONFIG;
export { STATUS_CODES }  