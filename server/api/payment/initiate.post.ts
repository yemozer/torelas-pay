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
  
  const { 
    amount, 
    orderId, 
    email, 
    installmentCount,
    paymentModel,
    cardNumber,
    expireDate,
    cvv 
  } = body
  
  // Validate required fields
  if (!amount || !orderId || !email || !paymentModel) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields'
    })
  }

  // Validate amount format
  const numericAmount = Number(amount)
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw createError({
      statusCode: 400,
      message: 'Invalid amount'
    })
  }

  // Get the request host from the event
  const host = event.node.req.headers.host
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`

  // Validate card details for 3D_PAY model
  if (paymentModel === '3D_PAY') {
    if (!cardNumber || !expireDate || !cvv) {
      throw createError({
        statusCode: 400,
        message: 'Card details are required for 3D_PAY payment model'
      })
    }

    // Validate card number (remove spaces and check length)
    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    if (!/^\d{16}$/.test(cleanCardNumber)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid card number'
      })
    }

    // Validate expiry date format (MMYY)
    if (!/^(0[1-9]|1[0-2])\d{2}$/.test(expireDate)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid expiry date format (MMYY)'
      })
    }

    // Validate CVV
    if (!/^\d{3}$/.test(cvv)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid CVV'
      })
    }
  }

  const paymentRequest = {
    amount: numericAmount,
    orderId,
    email,
    installmentCount,
    successUrl: `${baseUrl}/api/payment/callback/success?model=${paymentModel}`,
    failureUrl: `${baseUrl}/api/payment/callback/failure?model=${paymentModel}`,
    ...((paymentModel === '3D_PAY') && {
      cardNumber,
      expireDate,
      cvv
    })
  }

  let form;
  switch (paymentModel) {
    case '3D_PAY':
      form = paymentService.generate3DPayForm(paymentRequest);
      break;
    default:
      form = paymentService.generate3DPayHostingForm(paymentRequest);
  }

  return { form }
})
