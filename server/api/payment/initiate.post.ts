import { AkbankPaymentService } from '../../services/akbank-payment.service'

const config = {
  merchantSafeId: process.env.AKBANK_MERCHANT_SAFE_ID || '',
  terminalSafeId: process.env.AKBANK_TERMINAL_SAFE_ID || '',
  secretKey: process.env.AKBANK_SECRET_KEY || ''
}

const paymentService = new AkbankPaymentService(config)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { amount, orderId, email, installmentCount } = body
  
  if (!amount || !orderId || !email) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    })
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  
  const form = paymentService.generatePaymentForm({
    amount,
    orderId,
    email,
    installmentCount,
    successUrl: `${baseUrl}/api/payment/callback/success`,
    failureUrl: `${baseUrl}/api/payment/callback/failure`
  })

  return { form }
})
