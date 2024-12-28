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

  private generateRandomNumber(): string {
    const processId = process.pid.toString();
    const threadId = '1'; // Node.js is single-threaded
    const timestamp = new Date().getTime().toString();
    const secret = processId + threadId + timestamp;
    
    const srandom = crypto.createHash('sha256').update(secret).digest();
    let result = '';
    
    for (let i = 0; i < 128; i++) {
      result += (srandom[i % 32] % 16).toString(16).toUpperCase();
    }
    
    return result;
  }

  private calculateHash(params: string[], secretKey: string): string {
    const concatenated = params.join('');
    const hmac = crypto.createHmac('sha512', secretKey);
    return hmac.update(concatenated).digest('base64');
  }

  public generatePaymentForm(payment: PaymentRequest): string {
    const requestDateTime = new Date().toISOString();
    const randomNumber = this.generateRandomNumber();

    // Prepare parameters for hash calculation
    const hashParams = [
      '3D_PAY_HOSTING', // paymentModel
      '3000',           // txnCode for sales transaction
      this.config.merchantSafeId,
      this.config.terminalSafeId,
      payment.orderId,
      'TR',             // lang
      payment.amount.toFixed(2),
      '0.00',           // ccbRewardAmount
      '0.00',           // pcbRewardAmount
      '0.00',           // xcbRewardAmount
      '949',            // currencyCode (TRY)
      payment.installmentCount?.toString() || '1',
      payment.successUrl,
      payment.failureUrl,
      payment.email,
      '',               // subMerchantId
      randomNumber,
      requestDateTime,
      ''                // b2bIdentityNumber
    ];

    const hash = this.calculateHash(hashParams, this.config.secretKey);

    // Determine Akbank endpoint based on environment
    const akbankEndpoint = process.env.AKBANK_ENV === 'prod'
      ? 'https://virtualpospaymentgateway.akbank.com/payhosting'
      : 'https://virtualpospaymentgatewaypre.akbank.com/payhosting';

    // Generate HTML form
    return `
      <form id="akbankPaymentForm" action="${akbankEndpoint}" method="POST">
        <input type="hidden" name="paymentModel" value="3D_PAY_HOSTING">
        <input type="hidden" name="txnCode" value="3000">
        <input type="hidden" name="merchantSafeId" value="${this.config.merchantSafeId}">
        <input type="hidden" name="terminalSafeId" value="${this.config.terminalSafeId}">
        <input type="hidden" name="orderId" value="${payment.orderId}">
        <input type="hidden" name="lang" value="TR">
        <input type="hidden" name="amount" value="${payment.amount.toFixed(2)}">
        <input type="hidden" name="currencyCode" value="949">
        <input type="hidden" name="installCount" value="${payment.installmentCount || 1}">
        <input type="hidden" name="okUrl" value="${payment.successUrl}">
        <input type="hidden" name="failUrl" value="${payment.failureUrl}">
        <input type="hidden" name="emailAddress" value="${payment.email}">
        <input type="hidden" name="randomNumber" value="${randomNumber}">
        <input type="hidden" name="requestDateTime" value="${requestDateTime}">
        <input type="hidden" name="hash" value="${hash}">
      </form>
    `;
  }

  public verifyPaymentResponse(response: Record<string, string>): boolean {
    if (!response.hashParams || !response.hash) {
      return false;
    }

    const params = response.hashParams.split('+');
    const values = params.map(param => response[param] || '');
    const calculatedHash = this.calculateHash(values, this.config.secretKey);

    return calculatedHash === response.hash;
  }
}
