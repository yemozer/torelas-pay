import { generateHashSha1, generateHashSha512 } from '../utils/hash';

// Garanti Payment Gateway Settings
const GARANTI_SETTINGS = {
  MODE: 'TEST',
  API_VERSION: 'V0.1',
  BASE_URL: 'https://sanalposprovtest.garanti.com.tr/servlet/gt3dengine',
  PASSWORD: '123qweASD/',
  TERMINAL_ID: '30691297',
  MERCHANT_ID: '7000679',
  PROV_USER_ID: 'PROVAUT',
  USER_ID: 'PROVAUT',
} as const;

interface GarantiPaymentRequest {
  orderNo: string;
  amount: number; // in cents
  currencyCode: string;
  installment: string;
  cardNumber: string;
  cardExpireMonth: string;
  cardExpireYear: string;
  cardCvv: string;
  customerEmail: string;
  customerIp: string;
  successUrl: string;
  errorUrl: string;
  lang?: string;
}

export class GarantiPaymentService {
  private compute3DHash(params: {
    terminalId: string;
    orderNo: string;
    amount: string;
    successUrl: string;
    errorUrl: string;
    type: string;
    installment: string;
    storeKey: string;
  }): string {
    console.log('\nComputing 3D Hash:');
    
    // Step 1: Hash the password with terminal ID
    const temp = GARANTI_SETTINGS.PASSWORD + 
      String(GARANTI_SETTINGS.TERMINAL_ID).padStart(9, '0');
    console.log('Step 1 input:', temp);
    const hashedPassword = generateHashSha1(temp);
    console.log('Hashed password:', hashedPassword);

    // Step 2: Create the hash string
    const hashStr = String(GARANTI_SETTINGS.TERMINAL_ID) +
      params.orderNo +
      params.amount +
      params.successUrl +
      params.errorUrl +
      params.type +
      params.installment +
      params.storeKey +
      hashedPassword;
    console.log('Step 2 input:', hashStr);

    // Step 3: Generate final SHA512 hash
    const finalHash = generateHashSha512(hashStr);
    console.log('Final hash:', finalHash);
    
    return finalHash;
  }

  private createPaymentForm(params: GarantiPaymentRequest, secure3dhash: string): string {
    // Convert amount from cents to currency format (e.g., 1000 cents = 10.00)
    const formattedAmount = (params.amount / 100).toFixed(2);

    const formHtml = `
        <form action="${GARANTI_SETTINGS.BASE_URL}" method="POST" id="three_d_form">
          <input type="hidden" name="secure3dsecuritylevel" value="3D_PAY" />
          <input type="hidden" name="mode" value="${GARANTI_SETTINGS.MODE}" />
          <input type="hidden" name="apiversion" value="${GARANTI_SETTINGS.API_VERSION}" />
          <input type="hidden" name="terminalprovuserid" value="${GARANTI_SETTINGS.PROV_USER_ID}" />
          <input type="hidden" name="terminaluserid" value="${GARANTI_SETTINGS.USER_ID}" />
          <input type="hidden" name="terminalmerchantid" value="${GARANTI_SETTINGS.MERCHANT_ID}" />
          <input type="hidden" name="terminalid" value="${GARANTI_SETTINGS.TERMINAL_ID}" />
          <input type="hidden" name="txntype" value="sales" />
          <input type="hidden" name="txnamount" value="${formattedAmount}" />
          <input type="hidden" name="txncurrencycode" value="${params.currencyCode}" />
          <input type="hidden" name="txninstallmentcount" value="${params.installment}" />
          <input type="hidden" name="orderid" value="${params.orderNo}" />
          <input type="hidden" name="successurl" value="${params.successUrl}" />
          <input type="hidden" name="errorurl" value="${params.errorUrl}" />
          <input type="hidden" name="customeremailaddress" value="${params.customerEmail}" />
          <input type="hidden" name="customeripaddress" value="${params.customerIp}" />
          <input type="hidden" name="secure3dhash" value="${secure3dhash}" />
          <input type="hidden" name="cardnumber" value="${params.cardNumber}" />
          <input type="hidden" name="cardexpiredatemonth" value="${params.cardExpireMonth}" />
          <input type="hidden" name="cardexpiredateyear" value="${params.cardExpireYear}" />
          <input type="hidden" name="cardcvv2" value="${params.cardCvv}" />
          <input type="hidden" name="lang" value="${params.lang || 'tr'}" />
          <input type="hidden" name="txntimestamp" value="${new Date().toISOString()}" />
          <input type="hidden" name="refreshtime" value="0" />
        </form>
    `;

    return formHtml;
  }

  async initiatePayment(params: GarantiPaymentRequest): Promise<string> {
    try {
      // Format amount to 2 decimal places
      const formattedAmount = (params.amount / 100).toFixed(2);

      // Compute 3D secure hash
      const secure3dhash = this.compute3DHash({
        terminalId: GARANTI_SETTINGS.TERMINAL_ID,
        orderNo: params.orderNo,
        amount: formattedAmount,
        successUrl: params.successUrl,
        errorUrl: params.errorUrl,
        type: 'sales',
        installment: params.installment,
        storeKey: GARANTI_SETTINGS.PASSWORD,
      });

      // Generate and return payment form
      return this.createPaymentForm(params, secure3dhash);
    } catch (error) {
      console.error('Garanti payment initiation error:', error);
      throw new Error('Failed to initiate Garanti payment');
    }
  }
}

export const garantiPaymentService = new GarantiPaymentService();
