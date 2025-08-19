<template>
    <div class="create_group_container">
        <h1>Create New group</h1>
        <form @submit="handleGroupCreation">
            <input v-model="groupName" placeholder="group name">
            <input v-model="email" placeholder="email">
            <button type="submit">Submit</button>
        </form>
        <button @click="backHome">Go Back</button>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const groupName = ref('');
const email = ref('');

function handleGroupCreation(){
    // TODO: API request for a new group
}

function backHome(){
    router.push("/");
}
</script>