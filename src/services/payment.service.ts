import { PaymentRequest } from "../interfaces";

class PaymentService {
    async processPayment(request: PaymentRequest) {
    await new Promise((r) => setTimeout(r, 2000))
    
    return { message: `Charged ${request.amount} ${request.currency}`}
    }
}

const paymentService = new PaymentService()

export { paymentService }
