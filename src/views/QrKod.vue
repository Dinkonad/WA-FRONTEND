<template>
  <div class="dashboard">

    <BocnaNavigacija aktivna="qr" :otvoren="mobilniMeni" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">QR kod</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div class="stupac">
          <div class="qr-kartica">
            <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

            <template v-else-if="!token">
              <p class="qr-napomena">QR kod će biti vidljiv tek kada prođe uplata</p>
            </template>

            <template v-else>
              <p class="qr-vazi">Vrijedi do {{ formatirajDatum(vrijediDo) }}</p>
              <div class="qr-slika-wrap">
                <div ref="qrContainerRef" class="qr-slika"></div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api.js';
import { ucitajSkriptu } from '../utils/aktivnosti.js';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import BocnaNavigacija from '../components/BocnaNavigacija.vue';

const router = useRouter();

const mobilniMeni = ref(false);
const ucitavanje = ref(false);
const token = ref(null);
const vrijediDo = ref(null);
const qrContainerRef = ref(null);

function formatirajDatum(datum) {
  return new Date(datum).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function ucitajQrKod() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/clanarina/qr');
    token.value = data.token;
    vrijediDo.value = data.vrijediDo;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }

  if (!token.value) return;

  await nextTick();
  try {
    if (!window.QRCode) {
      await ucitajSkriptu('https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js');
    }
    qrContainerRef.value.innerHTML = '';
    const velicina = window.innerWidth < 400 ? 200 : 240;
    new window.QRCode(qrContainerRef.value, { text: token.value, width: velicina, height: velicina });
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  ucitajQrKod();
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
.sadrzaj { flex: 1; padding: 1.5rem 2rem 2rem; width: 100%; display: flex; align-items: center; justify-content: center; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 90; display: none; }

.ucitavanje { display: flex; justify-content: center; padding: 3rem; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(245,200,0,0.2);
  border-top-color: #f5c800;
  border-radius: 50%;
  animation: rotacija 0.8s linear infinite;
}
@keyframes rotacija { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.stupac {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 420px;
}

.qr-kartica {
  background: #252525;
  border: 1px solid rgba(245,200,0,0.3);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  width: 100%;
  text-align: center;
}


.qr-napomena {
  color: rgba(255,255,255,0.5);
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  margin: 0;
}

.qr-vazi {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  margin: 0 0 1.5rem;
}

.qr-slika-wrap {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  display: inline-block;
  max-width: 100%;
}

.qr-slika { display: block; max-width: 100%; }
.qr-slika :deep(canvas),
.qr-slika :deep(img) {
  max-width: 100%;
  height: auto !important;
  width: auto !important;
  display: block;
}

@media (max-width: 768px) {
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
}

@media (max-width: 480px) {
  .sadrzaj { padding: 1rem; }
  .qr-kartica { padding: 1.75rem 1.25rem; }
  .qr-slika-wrap { padding: 0.85rem; }
}
</style>
