<template>
  <div class="payment-container">
    <div v-if="!isLoading && !error">
      <button @click="initiatePayment" class="payment-button">
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
import { ref } from 'vue'

const props = defineProps<{
  amount: number
  orderId: string
  email: string
  installmentCount?: number
}>()

const isLoading = ref(false)
const error = ref('')

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
        installmentCount: props.installmentCount
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
}

.payment-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.payment-button:hover {
  background-color: #0056b3;
}

.loading {
  color: #666;
  margin: 1rem 0;
}

.error {
  color: #dc3545;
  margin: 1rem 0;
}
</style>
