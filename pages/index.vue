<template>
  <div class="container">
    <h1>Payment Integration Tests</h1>
    
    <div class="test-payment">
      <h2>Test Payment Details</h2>
      <div class="info">
        <p><strong>Amount:</strong> 1.00 TL</p>
        <p><strong>Order ID:</strong> TEST-{{ orderId }}</p>
        <p><strong>Email:</strong> test@example.com</p>
      </div>

      <div class="payment-options">
        <div class="payment-option">
          <h3>Akbank Payment</h3>
          <AkbankPayment
            :amount="1.00"
            :order-id="orderId"
            email="test@example.com"
            :installment-count="1"
          />
        </div>

        <div class="payment-option">
          <h3>QNB Payment</h3>
          <QNBPayment
            :amount="1.00"
            :order-id="orderId"
            :installment-count="0"
          />
        </div>

        <div class="payment-option">
          <h3>Garanti Payment</h3>
          <GarantiPayment
            :orderNo="orderId"
          />
        </div>
      </div>
    </div>

    <div class="test-cards">
      <h2>Test Cards</h2>
      <div class="card-info">
        <h3>Successful Payment</h3>
        <p><strong>Card Number:</strong> 4355 0843 5508 4358</p>
        <p><strong>Expiry:</strong> 12/2026</p>
        <p><strong>CVV:</strong> 000</p>
        <p><strong>3D Password:</strong> a</p>
      </div>

      <div class="card-info">
        <h3>Akbank Failed Payment</h3>
        <p><strong>Card Number:</strong> 4355 0843 5508 4359</p>
        <p><strong>Expiry:</strong> 12/2026</p>
        <p><strong>CVV:</strong> 000</p>
        <p><strong>3D Password:</strong> a</p>
      </div>

      <div class="card-info">
        <h3>QNB Successful Payment</h3>
        <p><strong>Card Number:</strong> 4282209027132016</p>
        <p><strong>Expiry:</strong> 05/2024</p>
        <p><strong>CVV:</strong> 123</p>
        <p><strong>3D Password:</strong> 123456</p>
      </div>

      <div class="card-info">
        <h3>QNB Failed Payment</h3>
        <p><strong>Card Number:</strong> 5406675406675403</p>
        <p><strong>Expiry:</strong> 12/2023</p>
        <p><strong>CVV:</strong> 000</p>
        <p><strong>3D Password:</strong> 123456</p>
      </div>

      <div class="card-info">
        <h3>Garanti Test Card</h3>
        <p><strong>Card Number:</strong> 5406697543211173</p>
        <p><strong>Expiry:</strong> 03/23</p>
        <p><strong>CVV:</strong> 465</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QNBPayment from '~/components/QNBPayment.vue'
import GarantiPayment from '~/components/GarantiPayment.vue'

// Generate a random order ID for testing
const orderId = ref(`${Date.now()}-${Math.random().toString(36).substring(2, 7)}`)
</script>

<style>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
}

h2 {
  color: #444;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.test-payment {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.info {
  margin-bottom: 1.5rem;
}

.test-cards {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
}

.card-info {
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.payment-options {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}

.payment-option {
  flex: 1;
  background: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-info:last-child {
  margin-bottom: 0;
}

h3 {
  color: #666;
  margin-bottom: 1rem;
}

p {
  margin: 0.5rem 0;
  color: #555;
}

strong {
  color: #333;
}

</style>
