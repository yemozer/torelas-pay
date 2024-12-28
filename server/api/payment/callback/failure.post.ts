import { AkbankPaymentService } from '../../../services/akbank-payment.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Pass all response data to the failure page
  return sendRedirect(event, `/payment/failure?${new URLSearchParams(body).toString()}`)
})
