<template>
  <div class="stranica-odabir">
    <div class="zuti-panel">
      <img src="../assets/logo.png" class="logo-slika" alt="Teretana Inspector" />
    </div>

    <div class="mobitel-zaglavlje">
      <img src="../assets/logo.png" class="logo-mobitel" alt="Teretana Inspector" />
      <div class="naslov-mobitel">TERETANA INSPECTOR</div>
    </div>

    <div class="desni-panel">
      <div class="sadrzaj">
        <h2 class="naslov">Spoji Stravu</h2>
        <p class="opis">Povežite vaš Strava račun kako biste pratili aktivnosti, statistike i karte treninga.</p>

        <div v-if="greska" class="poruka-greska">{{ greska }}</div>

        <button class="gumb-strava" @click="prijavaSStravom">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116z"/>
            <path d="M11.09 13.828l-2.09-4.116H5.95L11.09 20l3.192-6.316h-3.066l-.126.144z"/>
          </svg>
          Prijava putem Strave
        </button>

        <button class="gumb-bez-strave" @click="nastaviBeзStrave">
          Nastavi bez strave
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const greska = ref('');

onMounted(() => {
  if (route.query.greska === 'strava_odbijeno') greska.value = 'Strava prijava je odbijena.';
  if (route.query.greska === 'strava_greska') greska.value = 'Greška pri Strava prijavi. Pokušaj ponovo.';
});

function prijavaSStravom() {
  window.location.href = `${import.meta.env.VITE_API_URL}/strava/connect`;
}

function nastaviBeзStrave() {
  router.push('/dashboard');
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500&display=swap');

.stranica-odabir {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  background: #1e1e1e;
  font-family: 'Barlow', sans-serif;
  overflow: hidden;
  position: relative;
}

.zuti-panel {
  width: 52%;
  background: #f5c800;
  clip-path: polygon(0% 0%, 92% 0%, 100% 100%, 0% 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ulaziLijevo 0.7s cubic-bezier(0.77, 0, 0.18, 1) both;
}

@keyframes ulaziLijevo {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

.logo-slika {
  width: 220px;
  height: 220px;
  object-fit: contain;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.4));
  margin-right: 2rem;
}

.mobitel-zaglavlje { display: none; }

.desni-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  animation: ulaziDesno 0.7s cubic-bezier(0.77, 0, 0.18, 1) both;
}

@keyframes ulaziDesno {
  from { opacity: 0; transform: translateX(40px); }
  to   { opacity: 1; transform: translateX(0); }
}

.sadrzaj {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 320px;
}

.naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.05em;
  text-align: center;
  margin-bottom: 0.25rem;
}

.opis {
  color: rgba(255,255,255,0.45);
  font-size: 0.88rem;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.poruka-greska {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
  width: 100%;
  text-align: center;
}

.gumb-strava {
  background: #fc4c02;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  -webkit-tap-highlight-color: transparent;
}
.gumb-strava:hover { background: #e04400; transform: translateY(-2px); }
.gumb-strava:active { transform: scale(0.98); }

.gumb-bez-strave {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.4);
  font-family: 'Barlow', sans-serif;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.gumb-bez-strave:hover { color: #ffffff; }

@media (max-width: 700px) {
  .stranica-odabir { flex-direction: column; }
  .zuti-panel { display: none; }
  .mobitel-zaglavlje {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #f5c800;
    width: 100%;
    padding: 2rem 1rem 3.5rem;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
  }
  .logo-mobitel {
    width: 110px; height: 110px;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
    margin-bottom: 0.5rem;
  }
  .naslov-mobitel {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem; font-weight: 800;
    color: #1a1a1a; letter-spacing: 0.08em;
  }
  .desni-panel { flex: 1; width: 100%; padding: 3rem 1.5rem; animation: none; }
  .sadrzaj { max-width: 100%; }
  .gumb-strava { padding: 1rem; font-size: 1rem; }
}
</style>