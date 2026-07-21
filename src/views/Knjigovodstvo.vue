<template>
  <div class="dashboard">

    <aside class="sidebar" :class="{ 'sidebar-open': mobilniMeni }">
      <div class="sidebar-logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item" :class="{ active: prikaz === 'statistika' }" @click="prikaz = 'statistika'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>STATISTIKA</span>
        </button>
        <button class="nav-item" :class="{ active: prikaz === 'clanarina' }" @click="prikaz = 'clanarina'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
          <span>ČLANARINA</span>
        </button>
      </nav>
      <div class="sidebar-korisnik">
        <div class="korisnik-inicijali">{{ inicijali }}</div>
        <div class="korisnik-info">
          <span class="korisnik-ime">{{ auth.korisnik?.ime }}</span>
          <button class="gumb-odjava" @click="handleOdjava">Odjava</button>
        </div>
      </div>
    </aside>

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">{{ prikaz === 'statistika' ? 'Statistika' : 'Članarina' }}</h1>
        <div></div>
      </header>

      <div v-if="prikaz === 'statistika'" class="sadrzaj">
        <div class="prazno-veliko">Statistika dolazi uskoro.</div>
      </div>

      <div v-else class="sadrzaj">
        <div class="tabovi">
          <button class="tab" :class="{ 'tab-aktivan': tab === 'na_cekanju' }" @click="tab = 'na_cekanju'">Na čekanju</button>
          <button class="tab" :class="{ 'tab-aktivan': tab === 'odobreno' }" @click="tab = 'odobreno'">Odobreno</button>
          <button class="tab" :class="{ 'tab-aktivan': tab === 'odbijeno' }" @click="tab = 'odbijeno'">Odbijeno</button>
        </div>

        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-if="zahtjevi.length === 0" class="prazno">Nema zahtjeva u ovoj kategoriji.</div>

          <div v-for="z in zahtjevi" :key="z._id" class="red-zahtjeva">
            <div class="zahtjev-info">
              <div class="zahtjev-glavno">
                <span class="zahtjev-ime">{{ z.korisnikId?.ime || z.imePrezime }}</span>
                <span class="zahtjev-plan">{{ z.plan.toUpperCase() }} · {{ z.period === 'godisnje' ? 'godišnje' : 'mjesečno' }} · {{ z.cijena }} €</span>
              </div>
              <div class="zahtjev-detalji">
                <span>{{ z.korisnikId?.email }}</span>
                <span>Godište: {{ z.godiste }}</span>
                <span>Spol: {{ z.spol }}</span>
                <span>Broj: {{ z.broj }}</span>
                <span>Poslano: {{ formatirajDatum(z.createdAt) }}</span>
              </div>
              <p v-if="z.status === 'odbijeno' && z.napomenaOdbijanja" class="zahtjev-napomena">Razlog: {{ z.napomenaOdbijanja }}</p>
            </div>

            <div class="zahtjev-akcije">
              <template v-if="z.status === 'na_cekanju'">
                <button class="gumb-odobri" :disabled="obradujem === z._id" @click="odobri(z)">Odobri</button>
                <button class="gumb-odbij" :disabled="obradujem === z._id" @click="otvoriOdbijanje(z)">Odbij</button>
              </template>
              <button class="gumb-obrisi" :disabled="obradujem === z._id" @click="obrisi(z)" title="Obriši">✕</button>
            </div>

            <div v-if="otvoreniOdbij === z._id" class="odbijanje-forma">
              <input
                v-model="napomenaUnos"
                class="odbijanje-input"
                placeholder="Razlog odbijanja (opcionalno)"
                @keyup.enter="potvrdiOdbijanje(z)"
              />
              <button class="gumb-potvrdi-odbijanje" :disabled="obradujem === z._id" @click="potvrdiOdbijanje(z)">Potvrdi</button>
              <button class="gumb-otkazi-odbijanje" @click="otvoreniOdbij = null">Odustani</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

const router = useRouter();
const auth = useAuthStore();

const mobilniMeni = ref(false);
const prikaz = ref('clanarina');
const tab = ref('na_cekanju');
const ucitavanje = ref(false);
const zahtjevi = ref([]);
const obradujem = ref(null);
const otvoreniOdbij = ref(null);
const napomenaUnos = ref('');

const inicijali = computed(() => {
  const ime = auth.korisnik?.ime || '';
  return ime.split(' ').map(r => r[0]).join('').toUpperCase().slice(0, 2);
});

function formatirajDatum(datum) {
  return new Date(datum).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function ucitajZahtjeve() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get(`/clanarina?status=${tab.value}`);
    zahtjevi.value = data.zahtjevi || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

async function odobri(z) {
  obradujem.value = z._id;
  try {
    await api.put(`/clanarina/${z._id}/odobri`);
    zahtjevi.value = zahtjevi.value.filter(x => x._id !== z._id);
  } catch (err) {
    console.error(err);
  } finally {
    obradujem.value = null;
  }
}

function otvoriOdbijanje(z) {
  otvoreniOdbij.value = z._id;
  napomenaUnos.value = '';
}

async function potvrdiOdbijanje(z) {
  obradujem.value = z._id;
  try {
    await api.put(`/clanarina/${z._id}/odbij`, { napomena: napomenaUnos.value });
    zahtjevi.value = zahtjevi.value.filter(x => x._id !== z._id);
    otvoreniOdbij.value = null;
  } catch (err) {
    console.error(err);
  } finally {
    obradujem.value = null;
  }
}

async function obrisi(z) {
  if (!confirm(`Sigurno obrisati zahtjev za "${z.korisnikId?.ime || z.imePrezime}"? Ovo se ne može poništiti.`)) return;
  obradujem.value = z._id;
  try {
    await api.delete(`/clanarina/${z._id}`);
    zahtjevi.value = zahtjevi.value.filter(x => x._id !== z._id);
  } catch (err) {
    console.error(err);
  } finally {
    obradujem.value = null;
  }
}

function handleOdjava() {
  auth.odjava();
  router.push('/prijava');
}

watch(tab, ucitajZahtjeve);

onMounted(() => {
  ucitajZahtjeve();
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

.sidebar-korisnik {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.korisnik-inicijali {
  width: 42px; height: 42px; border-radius: 50%;
  background: #1a1a1a; color: #f5c800;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1rem; flex-shrink: 0;
}

.korisnik-info { display: flex; flex-direction: column; gap: 0.2rem; overflow: hidden; }
.korisnik-ime { color: #1a1a1a; font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gumb-odjava { background: none; border: none; color: rgba(0,0,0,0.5); font-size: 0.8rem; cursor: pointer; padding: 0; font-family: 'Barlow', sans-serif; }
.gumb-odjava:hover { color: #1a1a1a; }

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

.prazno-veliko {
  padding: 5rem 2rem;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 1rem;
}

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

.prazno { padding: 2.5rem; text-align: center; color: rgba(255,255,255,0.25); font-size: 0.95rem; }

.red-zahtjeva {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.red-zahtjeva:last-of-type { border-bottom: none; }

.zahtjev-info { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
.zahtjev-glavno { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
.zahtjev-ime {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
}
.zahtjev-plan { font-size: 0.82rem; color: #f5c800; font-weight: 700; }

.zahtjev-detalji {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
}

.zahtjev-napomena { font-size: 0.82rem; color: #fca5a5; margin: 0; }

.zahtjev-akcije { display: flex; gap: 0.5rem; flex-shrink: 0; }

.odbijanje-forma {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.odbijanje-input {
  flex: 1;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.55rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.85rem;
}
.odbijanje-input:focus { outline: none; border-color: #f5c800; }

.gumb-potvrdi-odbijanje {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}
.gumb-potvrdi-odbijanje:disabled { opacity: 0.5; cursor: not-allowed; }

.gumb-otkazi-odbijanje {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  flex-shrink: 0;
}
.gumb-otkazi-odbijanje:hover { color: #fff; }

.gumb-odobri {
  background: rgba(74,222,128,0.15);
  border: 1px solid rgba(74,222,128,0.35);
  color: #4ade80;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-odobri:hover:not(:disabled) { background: rgba(74,222,128,0.25); }

.gumb-odbij {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-odbij:hover:not(:disabled) { background: rgba(239,68,68,0.22); }

.gumb-obrisi {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.4);
  width: 38px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: border-color 0.2s, color 0.2s;
}
.gumb-obrisi:hover:not(:disabled) { border-color: #fca5a5; color: #fca5a5; }

.gumb-odobri:disabled, .gumb-odbij:disabled, .gumb-obrisi:disabled { opacity: 0.5; cursor: not-allowed; }

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
  .sadrzaj { padding: 1rem 1rem 1.5rem; }
  .red-zahtjeva { flex-direction: column; }
  .zahtjev-akcije { width: 100%; }
  .gumb-odobri, .gumb-odbij { flex: 1; }
}
</style>
