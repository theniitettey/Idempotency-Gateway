import { Request, Response, NextFunction } from "express";
import { STATUS_CODES } from "../config";

const requireIdempotencyKey = (req: Request, res: Response, next: NextFunction) => {
    const key = req.header("Idempotency-Key")
    if (!key || key.trim().length === 0) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: "Idempotency-Key is required",
            status: STATUS_CODES.BAD_REQUEST   
        })
    }
    next()
}

export {requireIdempotencyKey}
