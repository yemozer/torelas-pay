<template>
  <div class="payment-result error">
    <h1>Ödeme Başarısız</h1>
    
    <div v-if="error" class="error-details">
      <h2>Hata Detayları</h2>
      <div class="error-info">
        <p v-if="error.orderId"><strong>Sipariş ID:</strong> {{ error.orderId }}</p>
        <p v-if="error.responseCode"><strong>Yanıt Kodu:</strong> {{ error.responseCode }}</p>
        <p v-if="error.responseMessage"><strong>Yanıt Mesajı:</strong> {{ error.responseMessage }}</p>
        <p v-if="error.errorCode"><strong>Hata Kodu:</strong> {{ error.errorCode }}</p>
        <p v-if="error.errorMessage"><strong>Hata Mesajı:</strong> {{ error.errorMessage }}</p>
      </div>
    </div>

    <NuxtLink to="/" class="button">Tekrar Dene</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const error = ref(route.query)
</script>

<style scoped>
.payment-result {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

.error {
  color: #dc3545;
}

.button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.button:hover {
  background-color: #0056b3;
}
</style>
