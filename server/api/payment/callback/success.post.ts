import { AkbankPaymentService } from '../../../services/akbank-payment.service'

// Test credentials
const config = {
  merchantSafeId: '2023090417500272654BD9A49CF07574',
  terminalSafeId: '2023090417500284633D137A249DBBEB',
  secretKey: '3230323330393034313735303032363031353172675f357637355f3273387373745f7233725f73323333383737335f323272383774767276327672323531355f'
}

const paymentService = new AkbankPaymentService(config)

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const query = getQuery(event);
  const model = query.model as string;
  
  try {
    // Verify payment response hash
    const isValid = paymentService.verifyPaymentResponse(body);
    if (!isValid) {
      console.error('Invalid payment response hash');
      return sendRedirect(event, '/payment/failure?error=invalid_response');
    }

    // Check response code for both models
    if (body.responseCode !== 'VPS-0000') {
      console.error('Payment failed:', body.responseMessage);
      return sendRedirect(event, `/payment/failure?error=payment_failed&message=${encodeURIComponent(body.responseMessage || '')}`);
    }

    // Additional validation for 3D_PAY model
    if (model === '3D_PAY' && (!body.authCode || !body.rrn || !body.batchNumber || !body.stan)) {
      console.error('Missing required 3D_PAY response fields');
      return sendRedirect(event, `/payment/failure?error=invalid_response&message=Missing required fields`);
    }

    // Handle successful payment
    // You should implement your business logic here
    // For example, update order status, send confirmation email, etc.
    
    // Redirect to success page with transaction details
    const params = new URLSearchParams({
      orderId: body.orderId,
      amount: body.amount,
      txnCode: body.txnCode,
      paymentModel: model
    });
    
    return sendRedirect(event, `/payment/success?${params.toString()}`);
  } catch (error) {
    console.error('Payment processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return sendRedirect(event, `/payment/failure?error=processing_error&message=${encodeURIComponent(errorMessage)}`);
  }
})
