<template>
  <div class="stranica">
    <header class="header">
      <h1 class="naslov">Recepcija — skeniranje QR koda</h1>
      <OdjavaKrug />
    </header>

    <div class="sadrzaj">
      <div class="kamera-wrap" :class="{ 'kamera-zeleno': rezultat?.validno === true, 'kamera-crveno': rezultat?.validno === false }">
        <video ref="videoRef" class="kamera-video" playsinline muted></video>
        <canvas ref="canvasRef" class="skriveni-canvas"></canvas>

        <div v-if="greskaKamere" class="poruka-preko">{{ greskaKamere }}</div>

        <div v-if="pitanjeTip" class="pitanje-preko">
          <div class="pitanje-tekst">Je li član ušao ili izlazi?</div>
          <div class="pitanje-gumbi">
            <button class="gumb-tip gumb-ulaz" @click="odaberiTip('ulaz')">ULAZAK</button>
            <button class="gumb-tip gumb-izlaz" @click="odaberiTip('izlaz')">IZLAZAK</button>
          </div>
          <button class="gumb-otkazi-pitanje" @click="otkaziPitanje">Otkaži</button>
        </div>

        <div v-if="provjeravam" class="pitanje-preko">
          <div class="spinner-veliki"></div>
          <div class="pitanje-tekst">Provjeravam...</div>
        </div>

        <div v-if="rezultat" class="rezultat-preko">
          <div class="rezultat-ikona">{{ rezultat.validno ? '✓' : '✕' }}</div>
          <div class="rezultat-tekst">
            <template v-if="rezultat.validno">
              <div class="rezultat-ime">{{ rezultat.ime }}</div>
              <div class="rezultat-plan">{{ rezultat.plan?.toUpperCase() }} · vrijedi do {{ formatirajDatum(rezultat.vrijediDo) }}</div>
              <div class="rezultat-tip">{{ rezultat.tip === 'ulaz' ? 'ULAZAK' : 'IZLAZAK' }}</div>
              <div class="rezultat-ulaz">{{ rezultat.tip === 'ulaz' ? 'Ulaz' : 'Izlaz' }} {{ rezultat.brojDanas }}/{{ rezultat.limitDanas }} danas</div>
            </template>
            <template v-else>
              <div class="rezultat-ime">Nevažeći QR kod</div>
              <div class="rezultat-plan">{{ rezultat.poruka }}</div>
            </template>
          </div>
        </div>
      </div>

      <p class="uputa">Usmjeri kameru prema QR kodu člana.</p>

      <div class="teretana-kartica">
        <div class="teretana-naslov">TRENUTNO U TERETANI ({{ trenutnoUTeretani.length }})</div>
        <div v-if="trenutnoUTeretani.length === 0" class="teretana-prazno">Trenutno nema nikoga u teretani.</div>
        <div v-else class="teretana-lista">
          <div v-for="t in trenutnoUTeretani" :key="t.korisnikId" class="teretana-red">
            <span>{{ t.ime }}</span>
            <span class="teretana-vrijeme">od {{ formatirajVrijemeUlaska(t.vrijemeUlaska) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import api from '../services/api.js';
import { ucitajSkriptu } from '../utils/aktivnosti.js';
import OdjavaKrug from '../components/OdjavaKrug.vue';

const videoRef = ref(null);
const canvasRef = ref(null);
const rezultat = ref(null);
const greskaKamere = ref('');
const pitanjeTip = ref(false);
const provjeravam = ref(false);
const trenutnoUTeretani = ref([]);

let stream = null;
let animacijaId = null;
let obradaUToku = false;
let zakljucanoDo = 0;
let ocitaniToken = null;

function formatirajDatum(datum) {
  return new Date(datum).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatirajVrijemeUlaska(datum) {
  return new Date(datum).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
}

async function ucitajTrenutnoUTeretani() {
  try {
    const { data } = await api.get('/clanarina/trenutno-u-teretani');
    trenutnoUTeretani.value = data.lista || [];
  } catch (err) {
    console.error(err);
  }
}

async function pokreniKameru() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    videoRef.value.srcObject = stream;
    await videoRef.value.play();
    petljaSkeniranja();
  } catch (err) {
    console.error(err);
    greskaKamere.value = 'Ne mogu pristupiti kameri. Provjeri dozvole preglednika.';
  }
}

function petljaSkeniranja() {
  const video = videoRef.value;
  const canvas = canvasRef.value;
  if (!video || !canvas) return;

  const obradiFrame = () => {
    animacijaId = requestAnimationFrame(obradiFrame);

    if (Date.now() < zakljucanoDo) return;
    if (obradaUToku) return;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const slika = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const kod = window.jsQR(slika.data, slika.width, slika.height);
    if (kod?.data) {
      obradaUToku = true;
      ocitaniToken = kod.data;
      pitanjeTip.value = true;
    }
  };

  animacijaId = requestAnimationFrame(obradiFrame);
}

function otkaziPitanje() {
  pitanjeTip.value = false;
  ocitaniToken = null;
  obradaUToku = false;
}

async function odaberiTip(tip) {
  pitanjeTip.value = false;
  provjeravam.value = true;
  const tekst = ocitaniToken;
  ocitaniToken = null;

  try {
    const { data } = await api.post('/clanarina/qr/provjeri', { token: tekst, tip });
    rezultat.value = data;
    if (data.validno) ucitajTrenutnoUTeretani();
  } catch (err) {
    console.error(err);
    rezultat.value = { validno: false, poruka: 'Greška pri provjeri.' };
  } finally {
    provjeravam.value = false;
    zakljucanoDo = Date.now() + 3000;
    setTimeout(() => {
      rezultat.value = null;
      obradaUToku = false;
    }, 3000);
  }
}

onMounted(async () => {
  ucitajTrenutnoUTeretani();
  try {
    if (!window.jsQR) {
      await ucitajSkriptu('https://unpkg.com/jsqr@1.4.0/dist/jsQR.js');
    }
    await pokreniKameru();
  } catch (err) {
    console.error(err);
    greskaKamere.value = 'Greška pri učitavanju skenera. Provjeri internetsku vezu.';
  }
});

onBeforeUnmount(() => {
  if (animacijaId) cancelAnimationFrame(animacijaId);
  if (stream) stream.getTracks().forEach(t => t.stop());
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

* { box-sizing: border-box; }

.stranica {
  min-height: 100vh;
  min-height: 100dvh;
  background: #1a1a1a;
  color: #fff;
  font-family: 'Barlow', sans-serif;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  margin: 0;
}

.gumb-odjava {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Barlow', sans-serif;
  font-size: 0.85rem;
}
.gumb-odjava:hover { border-color: #f5c800; color: #f5c800; }

.sadrzaj {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  gap: 1.25rem;
}

.kamera-wrap {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1;
  background: #000;
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid rgba(255,255,255,0.1);
  transition: border-color 0.3s;
}

.kamera-zeleno { border-color: #4ade80; }
.kamera-crveno { border-color: #ef4444; }

.kamera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.skriveni-canvas { display: none; }

.poruka-preko {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: rgba(0,0,0,0.85);
  color: #fca5a5;
  font-size: 0.95rem;
}

.rezultat-preko {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(0,0,0,0.75);
  text-align: center;
  padding: 1.5rem;
}

.pitanje-preko {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  background: rgba(0,0,0,0.88);
  text-align: center;
  padding: 1.5rem;
}

.pitanje-tekst {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
}

.spinner-veliki {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(245,200,0,0.2);
  border-top-color: #f5c800;
  border-radius: 50%;
  animation: rotacija-spinner 0.8s linear infinite;
}
@keyframes rotacija-spinner { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.pitanje-gumbi {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.gumb-tip {
  flex: 1;
  padding: 1.1rem 0.5rem;
  border-radius: 12px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}
.gumb-tip:hover { opacity: 0.85; }

.gumb-ulaz { background: #4ade80; color: #0a2e1a; }
.gumb-izlaz { background: #f87171; color: #2e0a0a; }

.gumb-otkazi-pitanje {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.5);
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Barlow', sans-serif;
  font-size: 0.85rem;
}
.gumb-otkazi-pitanje:hover { color: #fff; }

.rezultat-tip {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fff;
  margin-top: 0.5rem;
}

.rezultat-ikona {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
}

.kamera-zeleno .rezultat-ikona { background: rgba(74,222,128,0.2); color: #4ade80; border: 3px solid #4ade80; }
.kamera-crveno .rezultat-ikona { background: rgba(239,68,68,0.2); color: #ef4444; border: 3px solid #ef4444; }

.rezultat-ime {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
}

.rezultat-plan {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  margin-top: 0.25rem;
}

.rezultat-ulaz {
  font-size: 0.8rem;
  color: #f5c800;
  margin-top: 0.4rem;
  font-weight: 700;
}

.uputa {
  color: rgba(255,255,255,0.4);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.teretana-kartica {
  width: 100%;
  max-width: 480px;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
}

.teretana-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #f5c800;
  margin-bottom: 0.75rem;
}

.teretana-prazno { color: rgba(255,255,255,0.3); font-size: 0.85rem; text-align: center; padding: 0.5rem 0; }

.teretana-lista { max-height: 220px; overflow-y: auto; }

.teretana-red {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 0.88rem;
}
.teretana-red:last-child { border-bottom: none; }
.teretana-vrijeme { color: rgba(255,255,255,0.4); font-size: 0.78rem; }
</style>
