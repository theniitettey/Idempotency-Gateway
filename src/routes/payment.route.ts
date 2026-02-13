import { Router } from "express";
import { paymentController } from "../controllers";

const router = Router()

router.post("/process-payment", paymentController.processPayment)

export default router
