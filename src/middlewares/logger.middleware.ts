import {Request, Response, NextFunction} from "express";
import { logger } from "../utils";
import PinoHttp from "pino-http";

const loggerMiddleware = PinoHttp({
    logger
})

export {loggerMiddleware}
