<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input v-model="email" placeholder="email" />
      <button type="submit">Send Code</button>
    </form>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    <button @click="backHome">Go Back</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const errorMessage = ref('');

function handleLogin() {
  if (!email.value) {
    errorMessage.value = 'Email is required';
    return;
  }
  
  fetch(`http://localhost:3000/api/login?email=${encodeURIComponent(email.value)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log(data); // { message: 'Login endpoint hit' }
      router.push('/verify');
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      errorMessage.value = 'Failed to send login code. Please try again.';
    });
}

async function backHome(){
  //const res = await fetch("http://localhost:3000/api/ping");
  //const data = await res.json();
  //console.log(data); // { message: 'pong' }
  router.push('/')
}

</script>

<style scoped>
.login-container {
  max-width: 300px;
  margin: auto;
  padding: 20px;
}
</style>
