import { AkbankPaymentService } from '../../../services/akbank-payment.service'

const config = {
  merchantSafeId: process.env.AKBANK_MERCHANT_SAFE_ID || '',
  terminalSafeId: process.env.AKBANK_TERMINAL_SAFE_ID || '',
  secretKey: process.env.AKBANK_SECRET_KEY || ''
}

const paymentService = new AkbankPaymentService(config)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!paymentService.verifyPaymentResponse(body)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid payment response'
    })
  }

  // Handle failed payment
  // You should implement your business logic here
  // For example, update order status, log error, etc.
  
  // Extract relevant error information
  const errorDetails = {
    responseCode: body.responseCode,
    responseMessage: body.responseMessage,
    orderId: body.orderId,
    errorCode: body.errorCode,
    errorMessage: body.errorMessage
  }

  // Redirect to failure page with error details
  return sendRedirect(event, `/payment/failure?${new URLSearchParams(errorDetails).toString()}`)
})
