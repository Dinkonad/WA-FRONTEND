<template>
  <div class="zaglavlje-meni">
    <div class="meni-wrap">
      <button class="ikona-gumb" @click.stop="otvoriObavijesti">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span v-if="obavijesti.length > 0" class="tocka-broj"></span>
      </button>

      <div v-if="obavijestiOtvorene" class="padajuci padajuci-obavijesti" @click.stop>
        <div class="padajuci-naslov">OBAVIJESTI</div>
        <div v-if="obavijesti.length === 0" class="padajuci-prazno">Nema novih obavijesti.</div>
        <div v-else class="obavijesti-lista">
          <div v-for="o in obavijesti" :key="o._id" class="obavijest-stavka">
            <p>{{ o.tekst }}</p>
            <span>{{ formatirajDatum(o.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="meni-wrap">
      <button class="ikona-gumb" @click.stop="otvoriProfil">
        <img v-if="auth.korisnik?.slika || auth.korisnik?.stravaProfilna" :src="auth.korisnik.slika || auth.korisnik.stravaProfilna" class="avatar-mini" />
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
      </button>

      <div v-if="profilOtvoren" class="padajuci padajuci-profil" @click.stop>
        <div class="profil-zaglavlje">
          <span class="profil-ime">{{ auth.korisnik?.ime }}</span>
          <span class="status-tocka" :class="clanAktivan ? 'status-zeleno' : 'status-crveno'"></span>
        </div>
        <button class="stavka-menija" @click="idiNa('/profil')">Profil</button>
        <button class="stavka-menija" @click="idiNa('/povijest-clanarina')">Povijest članarina</button>
        <button class="stavka-menija" @click="idiNa('/moji-rekordi')">Moji rekordi</button>
        <button class="stavka-menija" @click="idiNa('/feedback')">Feedback</button>
        <button class="stavka-menija stavka-odjava" @click="odjaviSe">Odjavi se</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

const router = useRouter();
const auth = useAuthStore();

const obavijestiOtvorene = ref(false);
const profilOtvoren = ref(false);
const obavijesti = ref([]);
const clanAktivan = ref(false);

function formatirajDatum(datum) {
  const d = new Date(datum);
  const dan = String(d.getDate()).padStart(2, '0');
  const mjesec = String(d.getMonth() + 1).padStart(2, '0');
  return `${dan}/${mjesec}/${d.getFullYear()}`;
}

async function ucitajObavijesti() {
  try {
    const { data } = await api.get('/obavijesti');
    obavijesti.value = data.obavijesti || [];
  } catch (err) {
    console.error(err);
  }
}

async function ucitajStatus() {
  try {
    const { data } = await api.get('/clanarina/moja');
    clanAktivan.value = !!(data.zahtjev?.status === 'odobreno' && !data.istekla);
  } catch (err) {
    console.error(err);
  }
}

function otvoriObavijesti() {
  profilOtvoren.value = false;
  obavijestiOtvorene.value = !obavijestiOtvorene.value;
}

function otvoriProfil() {
  obavijestiOtvorene.value = false;
  profilOtvoren.value = !profilOtvoren.value;
}

function idiNa(putanja) {
  profilOtvoren.value = false;
  router.push(putanja);
}

function odjaviSe() {
  auth.odjava();
  router.push('/prijava');
}

function zatvoriNaKlikVani() {
  obavijestiOtvorene.value = false;
  profilOtvoren.value = false;
}

onMounted(() => {
  ucitajObavijesti();
  ucitajStatus();
  document.addEventListener('click', zatvoriNaKlikVani);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', zatvoriNaKlikVani);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

* { box-sizing: border-box; }

.zaglavlje-meni {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.meni-wrap { position: relative; }

.ikona-gumb {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.1);
  color: #f5c800;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s;
}
.ikona-gumb:hover { border-color: #f5c800; }

.avatar-mini { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

.tocka-broj {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #1a1a1a;
}

.padajuci {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 200;
  overflow: hidden;
}

.padajuci-obavijesti { width: 300px; }
.padajuci-profil { width: 240px; padding: 0.5rem; }

.padajuci-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.06em;
  color: #1a1a1a;
  background: #f5c800;
  padding: 0.75rem 1rem;
}

.padajuci-prazno {
  padding: 1.5rem;
  text-align: center;
  color: rgba(255,255,255,0.35);
  font-size: 0.85rem;
}

.obavijesti-lista { max-height: 280px; overflow-y: auto; }

.obavijest-stavka {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.obavijest-stavka:last-child { border-bottom: none; }
.obavijest-stavka p { margin: 0 0 0.3rem; font-size: 0.85rem; color: #fff; line-height: 1.4; }
.obavijest-stavka span { font-size: 0.72rem; color: rgba(255,255,255,0.35); }

.profil-zaglavlje {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0.4rem;
}

.profil-ime { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.95rem; color: #fff; }

.status-tocka { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.status-zeleno { background: #4ade80; box-shadow: 0 0 5px rgba(74,222,128,0.6); }
.status-crveno { background: #ef4444; box-shadow: 0 0 5px rgba(239,68,68,0.6); }

.stavka-menija {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.75);
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  font-size: 0.87rem;
  cursor: pointer;
  transition: background 0.15s;
}
.stavka-menija:hover { background: rgba(245,200,0,0.1); color: #fff; }

.stavka-odjava { color: #fca5a5; margin-top: 0.2rem; }
.stavka-odjava:hover { background: rgba(239,68,68,0.12); color: #fca5a5; }

@media (max-width: 480px) {
  .padajuci {
    position: fixed;
    top: 4.75rem;
    left: 1rem;
    right: 1rem;
    width: auto;
  }
  .padajuci-obavijesti, .padajuci-profil { width: auto; }
}
</style>
