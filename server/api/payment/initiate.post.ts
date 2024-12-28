import { AkbankPaymentService } from '../../services/akbank-payment.service'

// Test credentials
const config = {
  merchantSafeId: '20231008172012760876143660674662',
  terminalSafeId: '30231008172012760876143660674662',
  secretKey: '32303232303432313136333632303233363567733773355f6731385f72375f6733337437726773335f7674383738763567387437335f5f737272763137736735'
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

  // Get the request host from the event
  const host = event.node.req.headers.host
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`
  
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
