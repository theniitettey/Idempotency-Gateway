import { Request, Response, NextFunction } from "express";
import { STATUS_CODES } from "../config";

export function errorHandlerMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message,
        status: STATUS_CODES.INTERNAL_SERVER_ERROR
    })
}