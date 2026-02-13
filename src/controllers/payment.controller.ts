import { Request, Response } from "express";
import { idempotencyStore, paymentService } from "../services";
import { hashBody } from "../utils";
import { STATUS_CODES } from "../config";

const processPayment = async (req: Request, res: Response) => {

        const key = req.headers["idempotency-key"] as string
        const requestHash = hashBody(req.body);

        const existing = idempotencyStore.get(key)

        // Case 1: key exists but with a different request body
        if (existing && existing.requestHash !== requestHash) {
            res.status(STATUS_CODES.BAD_REQUEST).json({
                success: false,
                message: "Idempotency key already used with different request body",
                status: STATUS_CODES.BAD_REQUEST
            })
            return
        }

       // Case 2: key existis and completed thus, replay
       if (existing && existing.status == "COMPLETED" && existing.response) {
        res.setHeader("X-Cache-Hit", "true")
        return res.status(existing.response.statusCode).json(existing.response.body)
       }

       // Case 3: key exists and in-flight => wait, then replay
       if (existing && existing.status == "IN_PROGRESS") {
        const storedResponse = await existing.promise

        res.setHeader("X-Cache-Hit", "true")
        return res.status(storedResponse.statusCode).json(storedResponse.body)
       }

       // Case 4: new request
       const entry = idempotencyStore.createInProgress(key, requestHash)
    try {
       const {amount, currency} = req.body

       if (typeof amount != "number" || typeof currency != "string") {
        idempotencyStore.fail(key, new Error("Invalid request payload"))

        res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: "Invalid request payload",
            status: STATUS_CODES.BAD_REQUEST
        })
        return
       }

       const response = await paymentService.processPayment({amount, currency})
       const stored = {statusCode: STATUS_CODES.OK, body: response}

       idempotencyStore.complete(key, stored)
       res.status(STATUS_CODES.OK).json(response)
       return
    } catch (error) {
        idempotencyStore.fail(key, error)
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
            status: STATUS_CODES.INTERNAL_SERVER_ERROR
        })
        return
    }
}

export {processPayment}
