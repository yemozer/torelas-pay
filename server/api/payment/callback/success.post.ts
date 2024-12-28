import { AkbankPaymentService } from '../../../services/akbank-payment.service'

// Test credentials
const config = {
  merchantSafeId: '20231008172012760876143660674662',
  terminalSafeId: '30231008172012760876143660674662',
  secretKey: '32303232303432313136333632303233363567733773355f6731385f72375f6733337437726773335f7674383738763567387437335f5f737272763137736735'
}

const paymentService = new AkbankPaymentService(config)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Log the response for debugging
  console.log('Payment Response:', body);

  // Handle successful payment
  // You should implement your business logic here
  // For example, update order status, send confirmation email, etc.
  
  // Redirect to success page
  return sendRedirect(event, '/payment/success')
})
