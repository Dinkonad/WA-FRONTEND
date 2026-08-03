<template>
  <div class="dashboard">

    <BocnaNavigacija :otvoren="mobilniMeni" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Povijest članarina</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-if="zahtjevi.length === 0" class="prazno">Još nema zahtjeva za članarinu.</div>

          <div v-for="z in zahtjevi" :key="z._id" class="red-zahtjeva">
            <div class="zahtjev-info">
              <div class="zahtjev-glavno">
                <span class="zahtjev-plan">{{ z.plan.toUpperCase() }}</span>
                <span class="zahtjev-cijena">{{ z.cijena }} €</span>
              </div>
              <div class="zahtjev-detalji">
                <span>Poslano: {{ formatirajDatum(z.createdAt) }}</span>
                <span v-if="z.datumObrade">Obrađeno: {{ formatirajDatum(z.datumObrade) }}</span>
              </div>
              <p v-if="z.status === 'odbijeno' && z.napomenaOdbijanja" class="zahtjev-napomena">Razlog: {{ z.napomenaOdbijanja }}</p>
            </div>
            <span class="oznaka-statusa" :class="`status-${z.status}`">{{ nazivStatusa(z.status) }}</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import BocnaNavigacija from '../components/BocnaNavigacija.vue';
import api from '../services/api.js';

const router = useRouter();

const mobilniMeni = ref(false);
const ucitavanje = ref(false);
const zahtjevi = ref([]);

function formatirajDatum(datum) {
  const d = new Date(datum);
  const dan = String(d.getDate()).padStart(2, '0');
  const mjesec = String(d.getMonth() + 1).padStart(2, '0');
  return `${dan}/${mjesec}/${d.getFullYear()}`;
}

function nazivStatusa(status) {
  if (status === 'odobreno') return 'Plaćeno';
  if (status === 'odbijeno') return 'Odbijeno';
  return 'Na čekanju';
}

async function ucitajPovijest() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/clanarina/moja-povijest');
    zahtjevi.value = data.zahtjevi || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

onMounted(() => {
  ucitajPovijest();
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
.zahtjev-plan {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: #f5c800;
}
.zahtjev-cijena { font-size: 0.95rem; font-weight: 700; }

.zahtjev-detalji {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
}

.zahtjev-napomena { font-size: 0.82rem; color: #fca5a5; margin: 0; }

.oznaka-statusa {
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}
.status-odobreno { background: rgba(74,222,128,0.15); color: #4ade80; }
.status-odbijeno { background: rgba(239,68,68,0.12); color: #fca5a5; }
.status-na_cekanju { background: rgba(245,200,0,0.15); color: #f5c800; }

@media (max-width: 768px) {
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
  .sadrzaj { padding: 1rem; }
  .red-zahtjeva { flex-direction: column; }
}
</style>
