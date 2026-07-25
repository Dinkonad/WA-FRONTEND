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
        <button class="nav-item active">
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
          <span>RECEPTI AI</span>
        </button>
      </nav>
    </aside>

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Fitnes Feed</h1>
        <ZaglavljeMeni />
      </header>

      <div v-if="ucitavanje && stavke.length === 0" class="ucitavanje"><div class="spinner"></div></div>

      <div v-else class="feed-lista">
        <div v-if="stavke.length === 0" class="prazno">Još nema aktivnosti u feedu. Uključi svoju aktivnost u feed na Statistike stranici.</div>

        <div v-for="a in stavke" :key="a._id" class="feed-kartica">
          <div class="feed-autor">
            <img v-if="a.autorSlika" :src="a.autorSlika" class="feed-avatar" />
            <div v-else class="feed-avatar-inicijali">{{ inicijaliIme(a.autorIme) }}</div>
            <div>
              <div class="feed-autor-ime">{{ a.autorIme }}</div>
              <div class="feed-tip-datum">{{ tipIkona(a.tip) }} {{ a.naziv }} · {{ formatirajDatum(a.datum) }}</div>
            </div>
          </div>

          <p v-if="a.opis" class="feed-opis">{{ a.opis }}</p>

          <div class="feed-stats">
            <div class="feed-stat">
              <span class="feed-stat-broj">{{ (a.udaljenost / 1000).toFixed(2) }}</span>
              <span class="feed-stat-label">km</span>
            </div>
            <div class="feed-stat">
              <span class="feed-stat-broj">{{ formatirajVrijeme(a.trajanje) }}</span>
              <span class="feed-stat-label">vrijeme</span>
            </div>
            <div class="feed-stat">
              <span class="feed-stat-broj">{{ tempo(a) }}</span>
              <span class="feed-stat-label">tempo /km</span>
            </div>
            <div class="feed-stat">
              <span class="feed-stat-broj">{{ a.kalorije ?? '—' }}</span>
              <span class="feed-stat-label">kcal</span>
            </div>
          </div>

          <div v-if="a.polyline" :id="`feed-karta-${a._id}`" class="feed-karta"></div>

          <div class="feed-akcije">
            <button class="feed-akcija" :class="{ 'feed-akcija-aktivna': a.lajkano }" @click="lajkaj(a)">
              {{ a.lajkano ? '❤' : '🤍' }} {{ a.brojLajkova }}
            </button>
            <button class="feed-akcija" @click="a.prikaziKomentare = !a.prikaziKomentare">
              💬 {{ a.komentari?.length || 0 }}
            </button>
          </div>

          <div v-if="a.imenaLajkera?.length" class="feed-lajkeri" :title="a.imenaLajkera.join(', ')">
            Sviđa se: {{ formatirajLajkere(a.imenaLajkera) }}
          </div>

          <div v-if="a.prikaziKomentare" class="feed-komentari">
            <div v-for="k in a.komentari" :key="k._id" class="feed-komentar">
              <b>{{ k.ime }}</b> {{ k.tekst }}
            </div>
            <div class="feed-novi-komentar">
              <input v-model="a.noviKomentar" placeholder="Dodaj komentar..." @keyup.enter="posaljiKomentar(a)" />
              <button @click="posaljiKomentar(a)">Pošalji</button>
            </div>
          </div>
        </div>

        <button v-if="imaJos && stavke.length > 0" class="gumb-vise" @click="ucitajJos" :disabled="ucitavanje">
          {{ ucitavanje ? 'Učitavam...' : 'PRIKAŽI VIŠE' }}
        </button>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';
import { tipIkona, formatirajDatum, formatirajVrijeme, ucitajLeaflet, inicijalizirajKartu } from '../utils/aktivnosti.js';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';

const router = useRouter();
const auth = useAuthStore();

const stavke = ref([]);
const ucitavanje = ref(false);
const stranica = ref(1);
const imaJos = ref(true);
const mobilniMeni = ref(false);
const brojUTeretani = ref(null);

function inicijaliIme(ime) {
  return (ime || '').split(' ').map(r => r[0]).join('').toUpperCase().slice(0, 2);
}

function tempo(a) {
  if (!a.udaljenost || !a.trajanje) return '—';
  const km = a.udaljenost / 1000;
  const sekPoKm = a.trajanje / km;
  const m = Math.floor(sekPoKm / 60);
  const s = Math.round(sekPoKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

async function ucitajFeed(dodaj = false) {
  ucitavanje.value = true;
  try {
    const { data } = await api.get(`/feed?stranica=${stranica.value}`);
    const nove = (data.aktivnosti || []).map(a => ({ ...a, prikaziKomentare: false, noviKomentar: '' }));
    if (dodaj) stavke.value.push(...nove);
    else stavke.value = nove;
    imaJos.value = nove.length === 10;

    await nextTick();
    await ucitajLeaflet();
    nove.forEach(a => { if (a.polyline) inicijalizirajKartu(`feed-karta-${a._id}`, a.polyline); });
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

async function ucitajJos() {
  stranica.value++;
  await ucitajFeed(true);
}

function formatirajLajkere(imena) {
  if (imena.length <= 2) return imena.join(' i ');
  return `${imena[0]}, ${imena[1]} i još ${imena.length - 2}`;
}

async function lajkaj(a) {
  const bio = a.lajkano;
  a.lajkano = !bio;
  a.brojLajkova += bio ? -1 : 1;
  try {
    const { data } = await api.post(`/feed/${a._id}/lajk`);
    a.lajkano = data.lajkano;
    a.brojLajkova = data.brojLajkova;
    a.imenaLajkera = data.imenaLajkera;
  } catch (err) {
    a.lajkano = bio;
    a.brojLajkova += bio ? 1 : -1;
    console.error(err);
  }
}

async function posaljiKomentar(a) {
  const tekst = a.noviKomentar?.trim();
  if (!tekst) return;
  try {
    const { data } = await api.post(`/feed/${a._id}/komentar`, { tekst });
    a.komentari = data.komentari;
    a.noviKomentar = '';
  } catch (err) {
    console.error(err);
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
  ucitajFeed();
  ucitajBrojUTeretani();
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

* {
  box-sizing: border-box;
}

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

.logo-img {
  width: 85px;
  height: 85px;
  object-fit: contain;
}

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

.nav-item.active,
.nav-item:hover {
  background: rgba(0,0,0,0.1);
}

.sidebar-korisnik {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.korisnik-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,0,0,0.2);
  flex-shrink: 0;
}

.korisnik-inicijali {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #1a1a1a;
  color: #f5c800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.korisnik-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
}

.korisnik-ime {
  color: #1a1a1a;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gumb-odjava {
  background: none;
  border: none;
  color: rgba(0,0,0,0.5);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  font-family: 'Barlow', sans-serif;
}

.gumb-odjava:hover {
  color: #1a1a1a;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}

.header-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  margin: 0;
}

.ikona-gumb {
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.ikona-gumb:hover {
  background: rgba(245,200,0,0.15);
  color: #f5c800;
}

.glavni {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.ucitavanje {
  display: flex;
  justify-content: center;
  padding: 5rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(245,200,0,0.2);
  border-top-color: #f5c800;
  border-radius: 50%;
  animation: rotacija 0.8s linear infinite;
}

@keyframes rotacija {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 90;
  display: none;
}

.prazno {
  padding: 3rem 2rem;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 0.95rem;
}

.feed-lista {
  padding: 1.5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}

.feed-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.25rem;
}

.feed-autor {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.feed-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.feed-avatar-inicijali {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f5c800;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  flex-shrink: 0;
}

.feed-autor-ime {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 0.98rem;
  letter-spacing: 0.02em;
}

.feed-tip-datum {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.4);
  margin-top: 0.1rem;
}

.feed-opis {
  font-size: 0.92rem;
  color: rgba(255,255,255,0.75);
  margin: 0 0 1rem;
  white-space: pre-wrap;
}

.feed-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.feed-stat {
  background: #1e1e1e;
  border-radius: 10px;
  padding: 0.65rem 0.4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.feed-stat-broj {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: #f5c800;
}

.feed-stat-label {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.04em;
}

.feed-karta {
  width: 100%;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #1e1e1e;
}

.feed-akcije {
  display: flex;
  gap: 1rem;
}

.feed-akcija {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.88rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.feed-akcija:hover {
  border-color: #f5c800;
  color: #fff;
}

.feed-akcija-aktivna {
  border-color: #f5c800;
  color: #f5c800;
}

.feed-lajkeri {
  margin-top: 0.6rem;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.45);
  cursor: default;
}

.feed-komentari {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.feed-komentar {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.75);
}

.feed-komentar b {
  color: #fff;
  margin-right: 0.4rem;
}

.feed-novi-komentar {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.feed-novi-komentar input {
  flex: 1;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.5rem 0.75rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.85rem;
}

.feed-novi-komentar input:focus {
  outline: none;
  border-color: #f5c800;
}

.feed-novi-komentar button {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
}

.gumb-vise {
  display: block;
  width: 100%;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  padding: 0.85rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: border-color 0.2s;
}

.gumb-vise:hover:not(:disabled) {
  border-color: #f5c800;
}

.gumb-vise:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .overlay {
    display: block;
  }

  .hamburger {
    display: flex;
  }

  .header {
    padding: 1.1rem 1.25rem;
  }

  .feed-lista {
    padding: 1rem 1rem 1.5rem;
  }

  .feed-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
