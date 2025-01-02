import crypto from 'crypto';

interface PaymentConfig {
  mbrId: string;          // Kurum Kodu
  merchantId: string;     // Üye işyeri numarası
  merchantPass: string;   // Üye işyeri 3D şifresi
  userCode: string;       // Kullanıcı Kodu
  userPass: string;       // Kullanıcı Şifre
}

interface PaymentRequest {
  orderId: string;
  amount: number;
  successUrl: string;
  failureUrl: string;
  installmentCount?: number;
}

export class QNBPaymentService {
  private config: PaymentConfig;
  
  constructor(config: PaymentConfig) {
    this.config = config;
  }

  private calculateHash(params: {
    mbrId: string;
    orderId: string;
    amount: string;
    okUrl: string;
    failUrl: string;
    txnType: string;
    installmentCount: string;
    rnd: string;
    merchantPass: string;
  }): string {
    // Build hash string as per QNB documentation
    const hashStr = params.mbrId + 
      params.orderId + 
      params.amount + 
      params.okUrl + 
      params.failUrl + 
      params.txnType + 
      params.installmentCount + 
      params.rnd + 
      params.merchantPass;

    // Calculate SHA1 hash and encode as base64
    const sha1Hash = crypto.createHash('sha1').update(hashStr).digest('hex');
    const hash = Buffer.from(sha1Hash, 'hex').toString('base64');

    return hash;
  }

  public generatePaymentForm(payment: PaymentRequest): string {
    const rnd = new Date().getTime().toString();
    const amount = (payment.amount * 100).toString(); // Convert to smallest currency unit

    const params = {
      mbrId: this.config.mbrId,
      orderId: payment.orderId,
      amount,
      okUrl: payment.successUrl,
      failUrl: payment.failureUrl,
      txnType: 'Auth',
      installmentCount: (payment.installmentCount || 0).toString(),
      rnd,
      merchantPass: this.config.merchantPass
    };

    // Calculate hash
    const hash = this.calculateHash(params);

    // Generate HTML form
    return `
      <form id="qnbPaymentForm" action="https://vpostest.qnb.com.tr/Gateway/3DHost.aspx" method="POST">
        <input type="hidden" name="MbrId" value="${this.config.mbrId}">
        <input type="hidden" name="MerchantID" value="${this.config.merchantId}">
        <input type="hidden" name="UserCode" value="${this.config.userCode}">
        <input type="hidden" name="UserPass" value="${this.config.userPass}">
        <input type="hidden" name="SecureType" value="3DHost">
        <input type="hidden" name="TxnType" value="Auth">
        <input type="hidden" name="InstallmentCount" value="${params.installmentCount}">
        <input type="hidden" name="Currency" value="949">
        <input type="hidden" name="OkUrl" value="${params.okUrl}">
        <input type="hidden" name="FailUrl" value="${params.failUrl}">
        <input type="hidden" name="OrderId" value="${params.orderId}">
        <input type="hidden" name="PurchAmount" value="${params.amount}">
        <input type="hidden" name="Lang" value="TR">
        <input type="hidden" name="Rnd" value="${params.rnd}">
        <input type="hidden" name="Hash" value="${hash}">
      </form>
    `;
  }

  public verifyPaymentResponse(response: Record<string, string>): boolean {
    try {
      // Extract necessary fields for hash verification
      const {
        MbrId: mbrId,
        OrderId: orderId,
        PurchAmount: amount,
        OkUrl: okUrl,
        FailUrl: failUrl,
        TxnType: txnType,
        InstallmentCount: installmentCount,
        Rnd: rnd,
        Hash: receivedHash
      } = response;

      if (!receivedHash) {
        console.error('No hash found in response');
        return false;
      }

      // Calculate hash using response parameters
      const calculatedHash = this.calculateHash({
        mbrId,
        orderId,
        amount,
        okUrl,
        failUrl,
        txnType,
        installmentCount,
        rnd,
        merchantPass: this.config.merchantPass
      });

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
