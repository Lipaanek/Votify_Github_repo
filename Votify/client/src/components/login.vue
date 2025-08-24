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
const groupId = ref('');
const errorMessage = ref('');

function handleLogin() {
  // TODO: udělat API request
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
