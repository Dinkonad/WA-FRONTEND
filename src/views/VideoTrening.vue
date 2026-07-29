<template>
  <div class="dashboard">

    <BocnaNavigacija aktivna="video" :otvoren="mobilniMeni" :prikazi-guzvu="false" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Video</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div v-if="!embedUrl" class="forma-red">
          <label class="forma-label">YouTube link</label>
          <input v-model="videoUrl" class="forma-input" placeholder="https://www.youtube.com/watch?v=..." />
        </div>

        <div class="video-trening-wrap">
          <div class="video-panel">
            <div v-if="embedUrl" class="video-okvir">
              <iframe :src="embedUrl" frameborder="0" allowfullscreen></iframe>
            </div>
            <div v-else class="video-prazno">Zalijepi YouTube link iznad da se prikaže video.</div>
            <button v-if="embedUrl" class="gumb-promijeni-video" @click="videoUrl = ''">Promijeni video</button>
          </div>

          <div class="kontrole-panel">
            <div class="kontrole-blok">
              <div class="kontrole-naslov">SET</div>
              <div class="kontrole-broj">{{ trenutniSet }}</div>
              <button class="gumb-plus-set" @click="trenutniSet += 1; trenutniPonavljanja = 0">+1 Set</button>
            </div>

            <div class="kontrole-blok">
              <div class="kontrole-naslov">PONAVLJANJA</div>
              <div class="kontrole-broj">{{ trenutniPonavljanja }}</div>
              <div class="reps-grid">
                <button v-for="r in [1, 2, 5, 10, 20, 30, 50]" :key="r" class="gumb-rep" @click="trenutniPonavljanja += r">+{{ r }}</button>
              </div>
              <button class="gumb-reset-manji" @click="trenutniPonavljanja = 0">Resetiraj ponavljanja</button>
            </div>

            <div class="kontrole-blok">
              <div class="kontrole-naslov">ŠTOPERICA</div>
              <div class="kontrole-vrijeme">{{ formatirajVrijeme(vrijemeSekunde) }}</div>
              <div class="stoperica-gumbi">
                <button class="gumb-stoperica" @click="pokreniPauziTimer">{{ timerAktivan ? 'Pauziraj' : 'Pokreni' }}</button>
                <button class="gumb-stoperica gumb-stoperica-sporedni" @click="resetirajTimer">Reset</button>
              </div>
            </div>

            <button class="gumb-novi-trening" @click="noviTrening">Novi trening (sve resetiraj)</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import BocnaNavigacija from '../components/BocnaNavigacija.vue';

const router = useRouter();

const mobilniMeni = ref(false);
const videoUrl = ref('');
const trenutniSet = ref(1);
const trenutniPonavljanja = ref(0);
const vrijemeSekunde = ref(0);
const timerAktivan = ref(false);
let timerIntervalId = null;

function ugradbeniUrl(url) {
  if (!url) return null;
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  const kratki = url.match(/youtu\.be\/([^?&]+)/);
  if (kratki) return `https://www.youtube.com/embed/${kratki[1]}`;
  const embed = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embed) return url;
  return null;
}

const embedUrl = computed(() => ugradbeniUrl(videoUrl.value));

function formatirajVrijeme(sekunde) {
  const min = Math.floor(sekunde / 60);
  const sek = sekunde % 60;
  return `${String(min).padStart(2, '0')}:${String(sek).padStart(2, '0')}`;
}

function pokreniPauziTimer() {
  if (timerAktivan.value) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
    timerAktivan.value = false;
  } else {
    timerAktivan.value = true;
    timerIntervalId = setInterval(() => { vrijemeSekunde.value += 1; }, 1000);
  }
}

function resetirajTimer() {
  clearInterval(timerIntervalId);
  timerIntervalId = null;
  timerAktivan.value = false;
  vrijemeSekunde.value = 0;
}

function noviTrening() {
  resetirajTimer();
  videoUrl.value = '';
  trenutniSet.value = 1;
  trenutniPonavljanja.value = 0;
}

onUnmounted(() => {
  clearInterval(timerIntervalId);
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
.sadrzaj { padding: 1.25rem 1.5rem 1.5rem; width: 100%; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 90; display: none; }

.forma-red { max-width: 500px; margin: 0 auto 1.25rem; }
.forma-label {
  display: block;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
  margin-bottom: 0.4rem;
}
.forma-input {
  width: 100%;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.65rem 0.9rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.9rem;
}
.forma-input:focus { outline: none; border-color: #f5c800; }

.video-trening-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-panel { display: flex; flex-direction: column; gap: 0.6rem; }

.video-okvir {
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.video-okvir iframe { width: 100%; height: 100%; border: none; }

.video-prazno {
  width: 100%;
  aspect-ratio: 16/9;
  background: #1e1e1e;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1.5rem;
  color: rgba(255,255,255,0.35);
  font-size: 0.9rem;
}

.gumb-promijeni-video {
  align-self: flex-start;
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.6);
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: 'Barlow', sans-serif;
}
.gumb-promijeni-video:hover { border-color: #f5c800; color: #f5c800; }

.kontrole-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.85rem;
}

.kontrole-blok {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.kontrole-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.08em;
}

.kontrole-broj {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: #f5c800;
  line-height: 1;
}

.kontrole-vrijeme {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.2rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.gumb-plus-set {
  width: 100%;
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.6rem 0.5rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-plus-set:hover { background: #ffd700; }

.reps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
  width: 100%;
}

.gumb-rep {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 0.45rem 0.2rem;
  border-radius: 6px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s;
}
.gumb-rep:hover { border-color: #f5c800; color: #f5c800; }

.gumb-reset-manji {
  background: none;
  border: none;
  color: rgba(255,255,255,0.35);
  font-size: 0.72rem;
  cursor: pointer;
  padding: 0.2rem;
  font-family: 'Barlow', sans-serif;
}
.gumb-reset-manji:hover { color: #f87171; }

.stoperica-gumbi { display: flex; gap: 0.5rem; width: 100%; }

.gumb-stoperica {
  flex: 1;
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.6rem 0.4rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-stoperica:hover { background: #ffd700; }

.gumb-stoperica-sporedni {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
}
.gumb-stoperica-sporedni:hover { background: rgba(255,255,255,0.08); }

.gumb-novi-trening {
  grid-column: 1 / -1;
  background: none;
  border: none;
  color: rgba(255,255,255,0.35);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.5rem;
  font-family: 'Barlow', sans-serif;
}
.gumb-novi-trening:hover { color: #f87171; }

@media (min-width: 900px) {
  .video-trening-wrap { flex-direction: row; align-items: flex-start; }
  .video-panel { flex: 2.2; }
  .kontrole-panel { flex: 1; grid-template-columns: 1fr; min-width: 220px; }
}

@media (orientation: landscape) and (max-width: 900px) {
  .sidebar { display: none; }
  .header { padding: 0.6rem 1rem; }
  .sadrzaj { padding: 0.6rem; }
  .forma-red { margin-bottom: 0.6rem; }
  .video-trening-wrap { flex-direction: row; align-items: flex-start; }
  .video-panel { flex: 2; }
  .video-okvir { aspect-ratio: 16/8; }
  .kontrole-panel { flex: 1; grid-template-columns: 1fr; gap: 0.5rem; min-width: 150px; }
  .kontrole-blok { padding: 0.6rem; }
  .kontrole-broj, .kontrole-vrijeme { font-size: 1.5rem; }
}

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
