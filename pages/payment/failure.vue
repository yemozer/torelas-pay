<template>
  <div class="payment-result error">
    <h1>Ödeme Başarısız</h1>
    <p>Ödeme işlemi sırasında bir hata oluştu.</p>
    <NuxtLink to="/" class="button">Tekrar Dene</NuxtLink>
  </div>
</template>

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
