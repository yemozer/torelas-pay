import { AkbankPaymentService } from '../../../services/akbank-payment.service'

// Test credentials
const config = {
  merchantSafeId: '2023090417500272654BD9A49CF07574',
  terminalSafeId: '2023090417500284633D137A249DBBEB',
  secretKey: '32303232303432313136333632303233363567733773355f6731385f72375f6733337437726773335f7674383738763567387437335f5f737272763137736735'
}

const paymentService = new AkbankPaymentService(config)

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  // Verify payment response hash
  const isValid = paymentService.verifyPaymentResponse(body);
  
  if (!isValid) {
    console.error('Invalid payment response hash');
    return sendRedirect(event, '/payment/failure?error=invalid_response');
  }

  // Log the verified response
  console.log('Verified Payment Response:', body);

  // Handle successful payment
  // You should implement your business logic here
  // For example, update order status, send confirmation email, etc.
  
  // Redirect to success page with transaction details
  const params = new URLSearchParams({
    orderId: body.orderId,
    amount: body.amount,
    txnCode: body.txnCode
  });
  
  return sendRedirect(event, `/payment/success?${params.toString()}`)
})
