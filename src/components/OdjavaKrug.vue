<template>
  <button class="odjava-krug" title="Odjava" @click="handleOdjava">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  </button>
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

<style scoped>
.odjava-krug {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.1);
  color: #f5c800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  flex-shrink: 0;
}
.odjava-krug:hover { border-color: #ef4444; color: #ef4444; }
</style>
