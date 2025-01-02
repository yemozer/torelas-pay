<template>
  <div class="payment-container">
    <div v-if="!isLoading && !error">
      <div class="payment-type-selector">
        <label>
          <input 
            type="radio" 
            v-model="paymentModel" 
            value="3D_PAY_HOSTING"
          > Banka Sayfasında Öde
        </label>
        <label>
          <input 
            type="radio" 
            v-model="paymentModel" 
            value="3D_PAY"
          > Kart ile Öde
        </label>
      </div>

      <!-- Card details form for 3D Pay model -->
      <div v-if="paymentModel === '3D_PAY'" class="card-details">
        <div class="form-group">
          <label>Kart Numarası</label>
          <input 
            type="text" 
            v-model="cardNumber"
            placeholder="**** **** **** ****"
            maxlength="16"
            @input="formatCardNumber"
          >
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Son Kullanma Tarihi</label>
            <input 
              type="text" 
              v-model="expireDate"
              placeholder="MMYY"
              maxlength="4"
            >
          </div>
          <div class="form-group">
            <label>CVV</label>
            <input 
              type="text" 
              v-model="cvv"
              placeholder="***"
              maxlength="3"
            >
          </div>
        </div>
      </div>

      <button 
        @click="initiatePayment" 
        class="payment-button"
        :disabled="!isFormValid"
      >
        Ödeme Yap
      </button>
    </div>
    <div v-if="isLoading" class="loading">
      İşleminiz gerçekleştiriliyor...
    </div>
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  amount: number
  orderId: string
  email: string
  installmentCount?: number
}>()

const isLoading = ref(false)
const error = ref('')
const paymentModel = ref('3D_PAY_HOSTING')
const cardNumber = ref('')
const expireDate = ref('')
const cvv = ref('')

const isFormValid = computed(() => {
  if (paymentModel.value === '3D_PAY') {
    return (
      cardNumber.value.replace(/\s/g, '').length === 16 &&
      expireDate.value.length === 4 &&
      cvv.value.length === 3
    )
  }
  return true
})

const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\s/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  cardNumber.value = value.replace(/(\d{4})/g, '$1 ').trim()
}

const initiatePayment = async () => {
  try {
    isLoading.value = true
    error.value = ''

    const response = await fetch('/api/payment/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: props.amount,
        orderId: props.orderId,
        email: props.email,
        installmentCount: props.installmentCount,
        paymentModel: paymentModel.value,
        ...(paymentModel.value === '3D_PAY' && {
          cardNumber: cardNumber.value.replace(/\s/g, ''),
          expireDate: expireDate.value,
          cvv: cvv.value
        })
      }),
    })

    if (!response.ok) {
      throw new Error('Ödeme başlatılamadı')
    }

    const { form } = await response.json()
    
    // Create temporary form and submit
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = form
    document.body.appendChild(tempDiv)
    const paymentForm = document.getElementById('akbankPaymentForm') as HTMLFormElement
    paymentForm?.submit()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Bir hata oluştu'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.payment-container {
  padding: 1rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.payment-type-selector {
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
}

.payment-type-selector label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.card-details {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.payment-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: background-color 0.2s;
}

.payment-button:hover:not(:disabled) {
  background-color: #0056b3;
}

.payment-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading {
  color: #666;
  margin: 1rem 0;
  text-align: center;
}

.error {
  color: #dc3545;
  margin: 1rem 0;
  padding: 0.5rem;
  border: 1px solid #dc3545;
  border-radius: 4px;
  background-color: #fff;
}

.payment-iframe {
  width: 100%;
  height: 700px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>
