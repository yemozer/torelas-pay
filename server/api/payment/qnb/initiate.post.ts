import { QNBPaymentService } from '../../../services/qnb-payment.service'

// Test credentials from QNB documentation
const config = {
  mbrId: '5',                                  // Kurum Kodu
  merchantId: '085300000009746',              // Merchant Terminal No
  merchantPass: '12345678',                   // Merchant Pass
  userCode: 'QNB_ISYERI_KULLANICI_HOST',     // Üye İşyeri Kullanıcı Adı
  userPass: 'a1234'                          // Üye İşyeri Şifre
}

const paymentService = new QNBPaymentService(config)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { amount, orderId, installmentCount } = body
  
  if (!amount || !orderId) {
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
    installmentCount,
    successUrl: `${baseUrl}/api/payment/qnb/callback/success`,
    failureUrl: `${baseUrl}/api/payment/qnb/callback/failure`
  })

  return { form }
})
