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
    // Prepare error parameters
    const params = new URLSearchParams({
      error: 'payment_failed',
      orderId: body.orderId || '',
      model: model || '',
      message: body.responseMessage || 'Payment failed'
    });

    // Include raw response for debugging if needed
    params.set('raw_error', JSON.stringify(body, null, 2));
    
    return sendRedirect(event, `/payment/failure?${params.toString()}`);
  } catch (error) {
    console.error('Payment failure processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return sendRedirect(event, `/payment/failure?error=processing_error&message=${encodeURIComponent(errorMessage)}`);
  }
})
