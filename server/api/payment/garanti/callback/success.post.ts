export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    
    console.log('Garanti payment success callback:', body);

    // Get host for redirect
    const host = getRequestHost(event);
    const protocol = getRequestProtocol(event);
    const baseUrl = `${protocol}://${host}`;

    // Redirect to success page with order details
    return sendRedirect(event, `${baseUrl}/payment/success?orderId=${body.orderid}&amount=${body.txnamount}`);
  } catch (error: any) {
    console.error('Garanti success callback error:', error);
    
    // Get host for redirect
    const host = getRequestHost(event);
    const protocol = getRequestProtocol(event);
    const baseUrl = `${protocol}://${host}`;
    
    // Redirect to failure page on error
    return sendRedirect(event, `${baseUrl}/payment/failure?error=${encodeURIComponent(error.message)}`);
  }
});
