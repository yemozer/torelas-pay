import { AkbankPaymentService } from '../../services/akbank-payment.service'

// Test credentials
const config = {
  merchantSafeId: '2023090417500272654BD9A49CF07574',
  terminalSafeId: '2023090417500284633D137A249DBBEB',
  secretKey: '3230323330393034313735303032363031353172675f357637355f3273387373745f7233725f73323333383737335f323272383774767276327672323531355f'
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
