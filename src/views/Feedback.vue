<template>
  <div class="dashboard">

    <BocnaNavigacija :otvoren="mobilniMeni" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Feedback</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div class="info-kartica">
          Ako imate nekih poteškoća, slobodno se javite.
        </div>

        <div class="forma-kartica">
          <label>Opiši svoj problem</label>
          <textarea v-model="tekst" rows="6" placeholder="Napiši svoju poruku ovdje..."></textarea>

          <div v-if="poruka" class="poruka-uspjeh">{{ poruka }}</div>
          <div v-if="greska" class="poruka-greska">{{ greska }}</div>

          <button class="gumb-posalji" :disabled="saljem || !tekst.trim()" @click="posaljiFeedback">
            {{ saljem ? 'Šaljem...' : 'Pošalji' }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import BocnaNavigacija from '../components/BocnaNavigacija.vue';
import api from '../services/api.js';

const router = useRouter();

const mobilniMeni = ref(false);
const tekst = ref('');
const saljem = ref(false);
const poruka = ref('');
const greska = ref('');

async function posaljiFeedback() {
  poruka.value = '';
  greska.value = '';
  saljem.value = true;
  try {
    await api.post('/feedback', { tekst: tekst.value });
    tekst.value = '';
    poruka.value = 'Hvala! Tvoja poruka je poslana.';
  } catch (err) {
    greska.value = err.response?.data?.poruka || 'Greška pri slanju.';
  } finally {
    saljem.value = false;
  }
}

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
.sadrzaj { padding: 1.5rem 2rem 2rem; max-width: 700px; width: 100%; margin: 0 auto; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 90; display: none; }

.info-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  color: rgba(255,255,255,0.6);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.forma-kartica {
  background: #252525;
  border: 1px solid rgba(245,200,0,0.25);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forma-kartica label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: #f5c800;
}

.forma-kartica textarea {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  padding: 0.9rem 1rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.92rem;
  resize: vertical;
}
.forma-kartica textarea:focus { outline: none; border-color: #f5c800; }

.poruka-uspjeh {
  background: rgba(74,222,128,0.12);
  border: 1px solid rgba(74,222,128,0.3);
  color: #4ade80;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.poruka-greska {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.gumb-posalji {
  align-self: flex-start;
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.7rem 1.6rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
}
.gumb-posalji:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
  .sadrzaj { padding: 1rem; }
}
</style>
