<template>
    <h1>Votify</h1>
    <p>Votify, the best online voting service.</p>
    <button @click="goToGroupCreate" class="create_group_btn">Create New Group</button>
    <button @click="goToLogin" class="login_btn">Have a Group?</button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

async function goToLogin() {
  router.push('/login'); // navigate after logging
}


function goToGroupCreate() {
  router.push('/newGroup')
}
</script>