import { QNBPaymentService } from '../../../../services/qnb-payment.service'

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
  
  // Verify payment response hash
  const isValid = paymentService.verifyPaymentResponse(body);
  
  if (!isValid) {
    console.error('Invalid payment response hash');
    return sendRedirect(event, '/payment/failure?error=invalid_response');
  }

  // Log the verified response
  console.log('Verified QNB Payment Response:', body);

  // Handle successful payment
  // You should implement your business logic here
  // For example, update order status, send confirmation email, etc.
  
  // Redirect to success page with transaction details
  const params = new URLSearchParams({
    orderId: body.OrderId,
    amount: body.PurchAmount,
    txnCode: body.AuthCode || ''
  });
  
  return sendRedirect(event, `/payment/success?${params.toString()}`)
})
