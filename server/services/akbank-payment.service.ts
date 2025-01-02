import crypto from 'crypto';
import { calculateHash } from '../utils/hash';

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
  // Optional card details for 3D model
  cardNumber?: string;
  expireDate?: string;
  cvv?: string;
}

export class AkbankPaymentService {
  private readonly API_URL = 'https://apipre.akbank.com/api/v1/payment/virtualpos/transaction/process';
  private config: PaymentConfig;
  
  constructor(config: PaymentConfig) {
    this.config = config;
  }

  private calculateFormHash(params: Record<string, string>, is3DModel: boolean = false): string {
    // Build data string based on payment model
    let data;
    if (is3DModel) {
      data = params.paymentModel +
        params.txnCode +
        params.merchantSafeId +
        params.terminalSafeId +
        params.orderId +
        params.lang +
        params.amount +
        (params.ccbRewardAmount || '') +
        (params.pcbRewardAmount || '') +
        (params.xcbRewardAmount || '') +
        params.currencyCode +
        params.installCount +
        params.okUrl +
        params.failUrl +
        params.emailAddress +
        (params.subMerchantId || '') +
        params.creditCard +
        params.expiredDate +
        params.cvv +
        params.randomNumber +
        params.requestDateTime +
        (params.b2bIdentityNumber || '');
    } else {
      // 3D PayHosting model
      data = params.paymentModel +
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
    }
    return calculateHash(data, this.config.secretKey);
  }

  private getRandomNumber(): string {
    return crypto.randomBytes(64).toString('hex').toUpperCase();
  }

  private formatDateTime(date: Date): string {
    return date.toISOString().slice(0, 23); // Format: YYYY-MM-DDTHH:mm:ss.SSS
  }

  public generate3DPayHostingForm(payment: PaymentRequest): string {
    const randomNumber = this.getRandomNumber();
    const requestDateTime = this.formatDateTime(new Date());

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
    const hash = this.calculateFormHash(params, false);

    // Generate HTML form
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

  public generate3DPayForm(payment: PaymentRequest): string {
    if (!payment.cardNumber || !payment.expireDate || !payment.cvv) {
      throw new Error('Card details are required for 3D PAY payment model');
    }

    const randomNumber = this.getRandomNumber();
    const requestDateTime = this.formatDateTime(new Date());

    const params = {
      paymentModel: '3D_PAY',
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
      creditCard: payment.cardNumber,
      expiredDate: payment.expireDate,
      cvv: payment.cvv,
      randomNumber,
      requestDateTime,
      subMerchantId: '',
      b2bIdentityNumber: '',
      ccbRewardAmount: '0.00',
      pcbRewardAmount: '0.00',
      xcbRewardAmount: '0.00'
    };
    
    // Calculate hash with actual parameters
    const hash = this.calculateFormHash(params, true);

    // Generate HTML form
    return `
      <form id="akbankPaymentForm" action="https://virtualpospaymentgatewaypre.akbank.com/securepay" method="POST" autocomplete="off">
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
        <input type="hidden" name="creditCard" value="${params.creditCard}">
        <input type="hidden" name="expiredDate" value="${params.expiredDate}">
        <input type="hidden" name="cvv" value="${params.cvv}">
        <input type="hidden" name="randomNumber" value="${params.randomNumber}">
        <input type="hidden" name="requestDateTime" value="${params.requestDateTime}">
        <input type="hidden" name="ccbRewardAmount" value="${params.ccbRewardAmount}">
        <input type="hidden" name="pcbRewardAmount" value="${params.pcbRewardAmount}">
        <input type="hidden" name="xcbRewardAmount" value="${params.xcbRewardAmount}">
        <input type="hidden" name="hash" value="${hash}">
      </form>
    `;
  }

  public verifyPaymentResponse(response: Record<string, string>): boolean {
    try {
      if (!response.hashParams || !response.hash) return false;
      
      const params = response.hashParams.split('+');
      const data = params.map(param => {
        const value = response[param] ?? '';
        return value;
      }).join('');

      const calculatedHash = calculateHash(data, this.config.secretKey);

      return calculatedHash === response.hash;
    } catch (error) {
      console.error('Error verifying payment response:', error);
      return false;
    }
  }
}
