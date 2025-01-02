<template>
  <div class="garanti-payment">
    <form @submit.prevent="handleSubmit" v-if="!loading">
      <div class="form-group">
        <label for="cardNumber">Card Number</label>
        <input
          id="cardNumber"
          v-model="formData.cardNumber"
          type="text"
          maxlength="16"
          placeholder="1234 5678 9012 3456"
          required
        />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="expireMonth">Expire Month</label>
          <select id="expireMonth" v-model="formData.cardExpireMonth" required>
            <option value="">MM</option>
            <option v-for="month in 12" :key="month" :value="month.toString().padStart(2, '0')">
              {{ month.toString().padStart(2, '0') }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="expireYear">Expire Year</label>
          <select id="expireYear" v-model="formData.cardExpireYear" required>
            <option value="">YY</option>
            <option v-for="year in years" :key="year" :value="year.toString().slice(-2)">
              {{ year }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="cvv">CVV</label>
          <input
            id="cvv"
            v-model="formData.cardCvv"
            type="text"
            maxlength="3"
            placeholder="123"
            required
          />
        </div>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Processing...' : 'Pay Now' }}
      </button>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <!-- Container for 3D Secure form -->
    <div v-if="loading">
      <p>Redirecting to Garanti 3D Secure...</p>
      <div ref="formContainer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  orderNo: string;
}>();

const loading = ref(false);
const error = ref('');
const formContainer = ref<HTMLDivElement | null>(null);

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear + i);
});

const formData = ref({
  orderNo: props.orderNo,
  amount: 100, // Fixed amount of 1 TL (100 kuruş)
  currencyCode: '949', // TRY
  installment: '0', // Single payment
  cardNumber: '',
  cardExpireMonth: '',
  cardExpireYear: '',
  cardCvv: '',
  customerEmail: 'test@example.com', // Fixed test email
  customerIp: '127.0.0.1', // Fixed local IP
});

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';

    const response = await fetch('/api/payment/garanti/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Payment initiation failed');
    }

    // Insert and submit 3D Secure form
    if (formContainer.value) {
      formContainer.value.innerHTML = result.form;
      const form = formContainer.value.querySelector('form');
      if (form) {
        form.submit();
      }
    }

  } catch (err: any) {
    error.value = err.message || 'An error occurred';
    loading.value = false;
  }
};
</script>

<style scoped>
.garanti-payment {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  margin-top: 15px;
  text-align: center;
}
</style>
