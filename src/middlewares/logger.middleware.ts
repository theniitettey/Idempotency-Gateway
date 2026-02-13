import {Request, Response, NextFunction} from "express";
import { logger } from "../utils";

const loggerMiddleware = function (req: Request, res: Response, next: NextFunction) {
    logger.info(`Request: ${req.method} ${req.url}`)
    next()
}

export {loggerMiddleware}
