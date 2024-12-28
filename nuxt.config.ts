// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    // Private keys that are exposed to the server
    akbankMerchantSafeId: process.env.AKBANK_MERCHANT_SAFE_ID,
    akbankTerminalSafeId: process.env.AKBANK_TERMINAL_SAFE_ID,
    akbankSecretKey: process.env.AKBANK_SECRET_KEY,
    akbankEnv: process.env.AKBANK_ENV || 'test',
  },
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true }
})
