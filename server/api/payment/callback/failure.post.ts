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
  
  // Redirect to failure page
  return sendRedirect(event, '/payment/failure')
})
