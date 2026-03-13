<template>
  <div class="stranica-dashboard">
    <nav class="navigacija">
      <div class="info-korisnika">
        <button class="gumb-odjava" @click="handleOdjava">Odjava</button>
      </div>
    </nav>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
 
const router = useRouter();
const auth = useAuthStore();
 
function handleOdjava() {
  auth.odjava();
  router.push('/prijava');
}
</script>
 