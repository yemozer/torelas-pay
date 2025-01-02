import { garantiPaymentService } from '~/server/services/garanti-payment.service';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    // Validate required fields
    const requiredFields = [
      'orderNo',
      'amount',
      'currencyCode',
      'installment',
      'cardNumber',
      'cardExpireMonth',
      'cardExpireYear',
      'cardCvv',
      'customerEmail',
      'customerIp',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Get host for success/error URLs
    const host = getRequestHost(event);
    const protocol = getRequestProtocol(event);
    const baseUrl = `${protocol}://${host}`;

    // Initialize payment with success/error URLs
    const paymentForm = await garantiPaymentService.initiatePayment({
      ...body,
      successUrl: `${baseUrl}/api/payment/garanti/callback/success`,
      errorUrl: `${baseUrl}/api/payment/garanti/callback/failure`,
    });

    return {
      success: true,
      form: paymentForm,
    };
  } catch (error: any) {
    console.error('Garanti payment initiation error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to initiate payment',
    };
  }
});
