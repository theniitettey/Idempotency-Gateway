import { Router } from "express";
import { paymentController } from "../controllers";

const router = Router()

router.post("/", paymentController.processPayment)

export default router
