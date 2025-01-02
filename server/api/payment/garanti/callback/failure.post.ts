export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    console.log('Garanti payment failure callback:', body);

    // Get host for redirect
    const host = getRequestHost(event);
    const protocol = getRequestProtocol(event);
    const baseUrl = `${protocol}://${host}`;

    // Extract error message from response
    const errorMessage = body.errmsg || 'Payment failed';
    const errorCode = body.procreturncode || '';
    
    // Construct error details
    const error = errorCode ? `${errorMessage} (Code: ${errorCode})` : errorMessage;

    // Redirect to failure page with error details
    return sendRedirect(event, `${baseUrl}/payment/failure?error=${encodeURIComponent(error)}&orderId=${body.orderid || ''}`);
  } catch (error: any) {
    console.error('Garanti failure callback error:', error);
    
    // Get host for redirect
    const host = getRequestHost(event);
    const protocol = getRequestProtocol(event);
    const baseUrl = `${protocol}://${host}`;
    
    // Redirect to failure page with generic error
    return sendRedirect(event, `${baseUrl}/payment/failure?error=${encodeURIComponent('An unexpected error occurred')}`);
  }
});
