<template>
  <div class="payment-result success">
    <h1>Ödeme Başarılı</h1>
    <p>Ödemeniz başarıyla gerçekleştirildi.</p>
    <NuxtLink to="/" class="button">Ana Sayfaya Dön</NuxtLink>
  </div>
</template>

<style scoped>
.payment-result {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  text-align: center;
}

.success {
  color: #28a745;
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
