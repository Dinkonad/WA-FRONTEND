<template>
  <div class="dashboard">

    <aside class="sidebar" :class="{ 'sidebar-open': mobilniMeni }">
      <div class="sidebar-logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
      </div>
      <div class="guzva-sidebar">
        <span class="guzva-tocka"></span>
        <span class="guzva-broj-sidebar">{{ brojUTeretani !== null ? brojUTeretani : '–' }}</span>
        <span class="guzva-tekst-sidebar">u teretani</span>
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item" @click="router.push('/dashboard')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>STATISTIKE</span>
        </button>
        <button class="nav-item" @click="router.push('/feed')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
          <span>FITNES FEED</span>
        </button>
        <button class="nav-item" @click="router.push('/izazovi')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
          <span>IZAZOVI</span>
        </button>
        <button class="nav-item" @click="router.push('/qr-kod')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="14" x2="14" y2="21"/><line x1="21" y1="14" x2="21" y2="14.01"/><line x1="14" y1="21" x2="21" y2="21"/></svg>
          <span>QR KOD</span>
        </button>
        <button class="nav-item" @click="router.push('/clanarina')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
          <span>ČLANARINA</span>
        </button>
        <button class="nav-item" @click="router.push('/treninzi')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5 17.5 17.5M8 4l-4 4 12 12 4-4z"/><path d="M2 22l3-3M16 8l3-3"/></svg>
          <span>TRENINZI</span>
        </button>
        <button class="nav-item" @click="router.push('/recepti')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M5 2v20M17 2c-2 3-2 8 0 11v9"/></svg>
          <span>RECEPTI</span>
        </button>
      </nav>
    </aside>

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Moji rekordi</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div class="tabovi">
          <button v-for="k in kategorije" :key="k.kljuc" class="tab" :class="{ 'tab-aktivan': tab === k.kljuc }" @click="tab = k.kljuc">
            {{ k.naziv }}
          </button>
        </div>

        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-for="r in rekordiTab" :key="r.naziv" class="red-rekord">
            <div class="rekord-info">
              <span class="rekord-naziv">{{ r.naziv }}</span>
              <span v-if="r.ostvareno" class="rekord-detalj">{{ formatirajDatum(r.datum) }} · {{ r.aktivnostNaziv }}</span>
              <span v-else class="rekord-detalj rekord-neostvareno">Još nema aktivnosti na ovoj udaljenosti</span>
            </div>
            <span class="rekord-vrijeme" :class="{ 'rekord-vrijeme-prazno': !r.ostvareno }">
              {{ r.ostvareno ? formatirajVrijeme(r.vrijeme) : '—' }}
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import api from '../services/api.js';

const router = useRouter();

const mobilniMeni = ref(false);
const ucitavanje = ref(false);
const rekordi = ref({});
const tab = ref('trcanje');
const brojUTeretani = ref(null);

const kategorije = [
  { kljuc: 'trcanje', naziv: 'Trčanje' },
  { kljuc: 'plivanje', naziv: 'Plivanje' },
  { kljuc: 'hodanje', naziv: 'Hodanje' },
  { kljuc: 'bicikl', naziv: 'Bicikl' },
];

const rekordiTab = computed(() => rekordi.value[tab.value] || []);

function formatirajDatum(datum) {
  const d = new Date(datum);
  const dan = String(d.getDate()).padStart(2, '0');
  const mjesec = String(d.getMonth() + 1).padStart(2, '0');
  return `${dan}/${mjesec}/${d.getFullYear()}`;
}

function formatirajVrijeme(sekunde) {
  const h = Math.floor(sekunde / 3600);
  const m = Math.floor((sekunde % 3600) / 60);
  const s = Math.floor(sekunde % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function ucitajRekorde() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/strava/rekordi');
    rekordi.value = data.rekordi || {};
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

async function ucitajBrojUTeretani() {
  try {
    const { data } = await api.get('/clanarina/broj-u-teretani');
    brojUTeretani.value = data.broj;
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  ucitajRekorde();
  ucitajBrojUTeretani();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

* { box-sizing: border-box; }

.dashboard {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: #1a1a1a;
  font-family: 'Barlow', sans-serif;
  color: #fff;
  font-size: 16px;
}

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

.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.06);
}

.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 0.25rem; }
.hamburger span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; }

.header-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.7rem; font-weight: 800; color: #fff; letter-spacing: 0.05em; margin: 0;
}

.glavni { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.sadrzaj { padding: 1.5rem 2rem 2rem; max-width: 800px; width: 100%; margin: 0 auto; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 90; display: none; }

.ucitavanje { display: flex; justify-content: center; padding: 4rem; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(245,200,0,0.2);
  border-top-color: #f5c800;
  border-radius: 50%;
  animation: rotacija 0.8s linear infinite;
}
@keyframes rotacija { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.tabovi { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.tab {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-aktivan { background: #f5c800; border-color: #f5c800; color: #1a1a1a; }

.lista-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 0.5rem 1.5rem;
}

.red-rekord {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.red-rekord:last-child { border-bottom: none; }

.rekord-info { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.rekord-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
}
.rekord-detalj { font-size: 0.8rem; color: rgba(255,255,255,0.4); }
.rekord-neostvareno { font-style: italic; }

.rekord-vrijeme {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  color: #f5c800;
  flex-shrink: 0;
}
.rekord-vrijeme-prazno { color: rgba(255,255,255,0.2); }

@media (max-width: 768px) {
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .sidebar-open { transform: translateX(0); }
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
  .sadrzaj { padding: 1rem; }
}
</style>
