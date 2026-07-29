<template>
  <aside class="sidebar" :class="{ 'sidebar-open': otvoren }">
    <div class="sidebar-logo">
      <img src="../assets/logo.png" alt="logo" class="logo-img" />
    </div>

    <div v-if="prikaziGuzvu" class="guzva-sidebar">
      <span class="guzva-tocka"></span>
      <span class="guzva-broj-sidebar">{{ brojUTeretani !== null ? brojUTeretani : '–' }}</span>
      <span class="guzva-tekst-sidebar">u teretani</span>
    </div>

    <nav class="sidebar-nav">
      <button
        v-for="s in stavke"
        :key="s.kljuc"
        class="nav-item"
        :class="{ active: aktivna === s.kljuc }"
        @click="aktivna !== s.kljuc && router.push(s.ruta)"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="s.svg"></svg>
        <span>{{ s.naziv }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api.js';

const props = defineProps({
  aktivna: { type: String, default: null },
  otvoren: { type: Boolean, default: false },
  prikaziGuzvu: { type: Boolean, default: true },
});

const router = useRouter();
const brojUTeretani = ref(null);

const stavke = [
  { kljuc: 'statistike', naziv: 'STATISTIKE', ruta: '/dashboard', svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { kljuc: 'feed', naziv: 'FITNES FEED', ruta: '/feed', svg: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>' },
  { kljuc: 'izazovi', naziv: 'IZAZOVI', ruta: '/izazovi', svg: '<circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/>' },
  { kljuc: 'qr', naziv: 'QR KOD', ruta: '/qr-kod', svg: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="14" x2="14" y2="21"/><line x1="21" y1="14" x2="21" y2="14.01"/><line x1="14" y1="21" x2="21" y2="21"/>' },
  { kljuc: 'clanarina', naziv: 'ČLANARINA', ruta: '/clanarina', svg: '<circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>' },
  { kljuc: 'video', naziv: 'VIDEO', ruta: '/video-trening', svg: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>' },
  { kljuc: 'treninzi', naziv: 'TRENINZI', ruta: '/treninzi', svg: '<path d="M6.5 6.5 17.5 17.5M8 4l-4 4 12 12 4-4z"/><path d="M2 22l3-3M16 8l3-3"/>' },
  { kljuc: 'recepti', naziv: 'RECEPTI', ruta: '/recepti', svg: '<path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M5 2v20M17 2c-2 3-2 8 0 11v9"/>' },
];

async function ucitajBrojUTeretani() {
  try {
    const { data } = await api.get('/clanarina/broj-u-teretani');
    brojUTeretani.value = data.broj;
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  if (props.prikaziGuzvu) ucitajBrojUTeretani();
});
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #f5c800;
  display: flex;
  flex-direction: column;
  padding: 1.75rem 0;
  flex-shrink: 0;
  z-index: 100;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1.5rem 1.75rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 1.25rem;
}

.logo-img { width: 85px; height: 85px; object-fit: contain; }

.guzva-sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 1rem 1rem 1.25rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0,0,0,0.12);
  border-radius: 20px;
}

.guzva-tocka {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1a7a3e;
  flex-shrink: 0;
  box-shadow: 0 0 5px rgba(26,122,62,0.6);
}

.guzva-broj-sidebar {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  color: #1a1a1a;
  font-size: 1rem;
}

.guzva-tekst-sidebar {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(0,0,0,0.6);
  letter-spacing: 0.03em;
}

.sidebar-nav {
  flex: 1;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #1a1a1a;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  text-align: left;
}

.nav-item.active, .nav-item:hover { background: rgba(0,0,0,0.1); }

@media (max-width: 768px) {
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .sidebar-open { transform: translateX(0); }
}
</style>
