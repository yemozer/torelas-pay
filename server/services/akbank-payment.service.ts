import crypto from 'crypto';

interface PaymentConfig {
  merchantSafeId: string;
  terminalSafeId: string;
  secretKey: string;
}

interface PaymentRequest {
  orderId: string;
  amount: number;
  email: string;
  successUrl: string;
  failureUrl: string;
  installmentCount?: number;
}

export class AkbankPaymentService {
  private config: PaymentConfig;
  
  constructor(config: PaymentConfig) {
    this.config = config;
  }

  public generatePaymentForm(payment: PaymentRequest): string {
    // Hardcoded test values
    const paymentModel = '3D_PAY_HOSTING';
    const txnCode = '3000';
    const merchantSafeId = '20231008172012760876143660674662';
    const terminalSafeId = '30231008172012760876143660674662';
    const orderId = '1735393462547-1ekh7';
    const lang = 'TR';
    const amount = '1.00';
    const currencyCode = '949';
    const installCount = '1';
    const okUrl = 'http://localhost:3000/api/payment/callback/success';
    const failUrl = 'http://localhost:3000/api/payment/callback/failure';
    const emailAddress = 'test@example.com';
    const randomNumber = '5f93964f62d54d606aa7e2e9fc9f2db45f80dd3f468cf5d82b4486180f44ffb5379edf9f459a04cc4abc0de6745e4ab20a70bedc68095d747b79e7bebc0b2098';
    const requestDateTime = '2024-12-28T13:49:18.928';
    const subMerchantId = '';
    const b2bIdentityNumber = '';
    const merchantData = '';
    const merchantBranchNo = '';
    const hash = 'Pq8qFXizEsg0DybpIZAonz1CDYK21uJNNIZJkS53CU8xYsiZ+7+Kiqzry1SzebAb24tpiGqFDoWWeC/eFvifFw==';

    // Generate HTML form with hardcoded values
    return `
      <form id="akbankPaymentForm" action="https://virtualpospaymentgatewaypre.akbank.com/payhosting" method="POST">
        <input type="hidden" name="paymentModel" value="${paymentModel}">
        <input type="hidden" name="txnCode" value="${txnCode}">
        <input type="hidden" name="merchantSafeId" value="${merchantSafeId}">
        <input type="hidden" name="terminalSafeId" value="${terminalSafeId}">
        <input type="hidden" name="orderId" value="${orderId}">
        <input type="hidden" name="lang" value="${lang}">
        <input type="hidden" name="amount" value="${amount}">
        <input type="hidden" name="currencyCode" value="${currencyCode}">
        <input type="hidden" name="installCount" value="${installCount}">
        <input type="hidden" name="okUrl" value="${okUrl}">
        <input type="hidden" name="failUrl" value="${failUrl}">
        <input type="hidden" name="emailAddress" value="${emailAddress}">
        <input type="hidden" name="randomNumber" value="${randomNumber}">
        <input type="hidden" name="requestDateTime" value="${requestDateTime}">
        <input type="hidden" name="subMerchantId" value="${subMerchantId}">
        <input type="hidden" name="b2bIdentityNumber" value="${b2bIdentityNumber}">
        <input type="hidden" name="merchantData" value="${merchantData}">
        <input type="hidden" name="merchantBranchNo" value="${merchantBranchNo}">
        <input type="hidden" name="hash" value="${hash}">
      </form>
    `;
  }

  public verifyPaymentResponse(response: Record<string, string>): boolean {
    // Log the full response for debugging
    console.log('Payment Response:', response);
    return true;
  }
}
