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

  private calculateHash(params: Record<string, string>): string {
    // Build data string exactly as shown in documentation
    const data = params.paymentModel +
      params.txnCode +
      params.merchantSafeId +
      params.terminalSafeId +
      params.orderId +
      params.lang +
      params.amount +
      params.currencyCode +
      params.installCount +
      params.okUrl +
      params.failUrl +
      params.emailAddress +
      (params.subMerchantId || '') +
      '' + // creditCard
      '' + // expiredDate
      '' + // cvv
      params.randomNumber +
      params.requestDateTime +
      (params.b2bIdentityNumber || '');

    // Create HMAC SHA512 with raw secret key (matching Java implementation)
    const hmac = crypto.createHmac('sha512', this.config.secretKey);
    
    // Update with UTF-8 encoded data (matching Java's data.getBytes("UTF-8"))
    hmac.update(Buffer.from(data, 'utf8'));
    
    // Get Base64 encoded hash (matching Java's Base64.getEncoder().encodeToString())
    const hash = hmac.digest('base64');

    console.log('Data String:', data);
    console.log('Secret Key:', this.config.secretKey);
    console.log('Calculated Hash:', hash);
    return hash;
  }

  public generatePaymentForm(payment: PaymentRequest): string {
    const randomNumber = crypto.randomBytes(64).toString('hex');
    const now = new Date();
    const requestDateTime = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + 'T' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0') + ':' +
      String(now.getSeconds()).padStart(2, '0') + '.' +
      String(now.getMilliseconds()).padStart(3, '0');

    const params = {
      paymentModel: '3D_PAY_HOSTING',
      txnCode: '3000',
      merchantSafeId: this.config.merchantSafeId,
      terminalSafeId: this.config.terminalSafeId,
      orderId: payment.orderId,
      lang: 'TR',
      amount: payment.amount.toFixed(2),
      currencyCode: '949',
      installCount: (payment.installmentCount || 1).toString(),
      okUrl: payment.successUrl,
      failUrl: payment.failureUrl,
      emailAddress: payment.email,
      randomNumber,
      requestDateTime,
      subMerchantId: '',
      b2bIdentityNumber: '',
      merchantData: '',
      merchantBranchNo: ''
    };
    
    // Calculate hash with actual parameters
    const hash = this.calculateHash(params);

    // Generate HTML form with test parameters
    return `
      <form id="akbankPaymentForm" action="https://virtualpospaymentgatewaypre.akbank.com/payhosting" method="POST">
        <input type="hidden" name="paymentModel" value="${params.paymentModel}">
        <input type="hidden" name="txnCode" value="${params.txnCode}">
        <input type="hidden" name="merchantSafeId" value="${params.merchantSafeId}">
        <input type="hidden" name="terminalSafeId" value="${params.terminalSafeId}">
        <input type="hidden" name="orderId" value="${params.orderId}">
        <input type="hidden" name="lang" value="${params.lang}">
        <input type="hidden" name="amount" value="${params.amount}">
        <input type="hidden" name="currencyCode" value="${params.currencyCode}">
        <input type="hidden" name="installCount" value="${params.installCount}">
        <input type="hidden" name="okUrl" value="${params.okUrl}">
        <input type="hidden" name="failUrl" value="${params.failUrl}">
        <input type="hidden" name="emailAddress" value="${params.emailAddress}">
        <input type="hidden" name="randomNumber" value="${params.randomNumber}">
        <input type="hidden" name="requestDateTime" value="${params.requestDateTime}">
        <input type="hidden" name="subMerchantId" value="${params.subMerchantId}">
        <input type="hidden" name="b2bIdentityNumber" value="${params.b2bIdentityNumber}">
        <input type="hidden" name="merchantData" value="${params.merchantData}">
        <input type="hidden" name="merchantBranchNo" value="${params.merchantBranchNo}">
        <input type="hidden" name="hash" value="${hash}">
      </form>
    `;
  }

  public verifyPaymentResponse(response: Record<string, string>): boolean {
    try {
      // Extract hash from response
      const receivedHash = response.hash;
      if (!receivedHash) {
        console.error('No hash found in response');
        return false;
      }

      // Create a copy of response without the hash
      const { hash, ...params } = response;

      // Calculate hash from response parameters
      const calculatedHash = this.calculateHash(params);

      // Compare hashes
      const isValid = receivedHash === calculatedHash;
      
      if (!isValid) {
        console.error('Hash verification failed', {
          received: receivedHash,
          calculated: calculatedHash
        });
      }

      return isValid;
    } catch (error) {
      console.error('Error verifying payment response:', error);
      return false;
    }
  }
}
