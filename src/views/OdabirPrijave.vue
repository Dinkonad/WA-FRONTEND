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
        <button class="gumb-strava" @click="prijavaSStravom">
          PRIJAVA PUTEM STRAVE
        </button>
        <button class="gumb-bez-strave" @click="nastaviBeзStrave">
          Nastavi bez strave
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function prijavaSStravom() {
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

.mobitel-zaglavlje {
  display: none;
}

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
  gap: 1.25rem;
  width: 100%;
  max-width: 300px;
}

.gumb-strava {
  background: #f5c800;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  width: 100%;
  -webkit-tap-highlight-color: transparent;
}

.gumb-strava:hover { background: #ffd700; transform: translateY(-2px); }
.gumb-strava:active { transform: scale(0.98); }

.gumb-bez-strave {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Barlow', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.gumb-bez-strave:hover { color: #ffffff; }

@media (max-width: 700px) {
  .stranica-odabir {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  .zuti-panel {
    display: none;
  }

  .mobitel-zaglavlje {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5c800;
    width: 100%;
    padding: 2rem 1rem 3.5rem;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
  }

  .logo-mobitel {
    width: 110px;
    height: 110px;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
    margin-bottom: 0.5rem;
  }

  .naslov-mobitel {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: 0.08em;
  }

  .desni-panel {
    flex: 1;
    width: 100%;
    padding: 3rem 1.5rem;
    animation: none;
  }

  .sadrzaj {
    max-width: 100%;
  }

  .gumb-strava {
    padding: 1rem;
    font-size: 1rem;
  }
}
</style>