<template>
  <div style="padding:2rem; color:#fff; background:#1e1e1e; min-height:100vh;">
    <button @click="handleOdjava">Odjava</button>
    <h2>Aktivnosti</h2>
    <p v-if="ucitavanje">Učitavanje...</p>
    <p v-if="greska" style="color:red;">{{ greska }}</p>
    <ul>
      <li v-for="akt in aktivnosti" :key="akt.stravaId">
        {{ akt.naziv }} — {{ (akt.udaljenost / 1000).toFixed(1) }} km — {{ formatirajDatum(akt.datum) }}
      </li>
    </ul>
    <p v-if="!ucitavanje && aktivnosti.length === 0">Nema aktivnosti.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const aktivnosti = ref([]);
const ucitavanje = ref(false);
const greska = ref('');

onMounted(async () => {
  const token = route.query.token;
  if (token) {
    await auth.postaviTokenIzURL(token);
    router.replace('/dashboard');
  }

  ucitavanje.value = true;
  try {
    await api.post('/strava/sync');
  } catch (e) {}

  try {
    const { data } = await api.get('/strava/aktivnosti?velicina=5');
    aktivnosti.value = data.aktivnosti || [];
  } catch (err) {
    greska.value = err.response?.data?.poruka || 'Greška pri dohvaćanju.';
  } finally {
    ucitavanje.value = false;
  }
});

function handleOdjava() {
  auth.odjava();
  router.push('/prijava');
}

function formatirajDatum(datum) {
  return new Date(datum).toLocaleDateString('hr-HR');
}
</script>