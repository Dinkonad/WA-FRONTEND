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
        <button class="nav-item" @click="router.push('/feed')">
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
        <button class="nav-item active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5 17.5 17.5M8 4l-4 4 12 12 4-4z"/><path d="M2 22l3-3M16 8l3-3"/></svg>
          <span>TRENINZI</span>
        </button>
        <button class="nav-item" @click="router.push('/recepti')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M5 2v20M17 2c-2 3-2 8 0 11v9"/></svg>
          <span>RECEPTI</span>
        </button>
      </nav>
    </aside>

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Treninzi</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else-if="!jePremium" class="zakljucano-kartica">
          <div class="zakljucano-ikona">🔒</div>
          <h2 class="zakljucano-naslov">Premium sadržaj</h2>
          <p class="zakljucano-tekst">Treninzi koje postavlja tvoj trener dostupni su uz Premium članarinu.</p>
          <button class="gumb-nadogradi" @click="router.push('/clanarina')">Nadogradi na Premium</button>
        </div>

        <template v-else>
          <template v-if="korak === 'kategorija'">
            <div v-if="ucitavanjeOpcije" class="ucitavanje"><div class="spinner"></div></div>
            <template v-else>
              <button class="trening-istaknuto" @click="otvoriTreninge">
                <div class="trening-istaknuto-ikona">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="3" width="16" height="18" rx="2"/>
                    <path d="M8 9l2 2 4-4"/>
                    <path d="M8 16h8"/>
                  </svg>
                </div>
                <div class="trening-istaknuto-tekst">
                  <div class="trening-istaknuto-naslov">TRENING</div>
                  <p class="trening-istaknuto-opis">Gotovi treninzi koje je sastavio tvoj trener — spreman plan za odraditi.</p>
                </div>
                <span class="trening-istaknuto-strelica">›</span>
              </button>

              <div class="razmak-naslov">ILI ODABERI MIŠIĆNU SKUPINU</div>
              <div class="kategorija-grid">
                <button v-for="k in kategorije" :key="k.kljuc" class="kategorija-kartica" @click="odaberiKategoriju(k.kljuc)">
                  <span class="kategorija-kartica-label">{{ k.naziv }}</span>
                </button>
              </div>
            </template>
          </template>

          <template v-else-if="korak === 'treninzi'">
            <button class="gumb-nazad" @click="korak = 'kategorija'">‹ Nazad</button>
            <h2 class="lista-naslov">Gotovi treninzi</h2>

            <div v-if="ucitavanjeTreninga" class="ucitavanje"><div class="spinner"></div></div>
            <div v-else-if="treninzi.length === 0" class="prazno-vjezbe">Još nema gotovih treninga.</div>
            <div v-else class="treninzi-lista">
              <button v-for="t in treninzi" :key="t._id" class="trening-kartica" @click="otvoriTrening(t._id)">
                <div class="trening-naziv">{{ t.naziv }}</div>
                <p v-if="t.opis" class="trening-opis">{{ t.opis }}</p>
                <span class="trening-broj">{{ t.brojVjezbi }} {{ t.brojVjezbi === 1 ? 'vježba' : 'vježbi' }}</span>
              </button>
            </div>
          </template>

          <template v-else-if="korak === 'trening-detalji'">
            <button class="gumb-nazad" @click="korak = 'treninzi'">‹ Nazad</button>
            <h2 class="lista-naslov">{{ odabraniTrening?.naziv }}</h2>
            <p v-if="odabraniTrening?.opis" class="trening-detalji-opis">{{ odabraniTrening.opis }}</p>

            <div v-if="!ucitavanjeTreningaDetalji && odabraniTrening" class="trening-info-traka">
              <span>{{ odabraniTrening.nacinIzvodjenja === 'kruzno' ? 'Kružno — naizmjenično po jedna serija' : 'Redom — sve serije jedne vježbe pa sljedeća' }}</span>
              <span v-if="procijenjenoTrajanje">~{{ procijenjenoTrajanje }} min</span>
            </div>

            <button
              v-if="!ucitavanjeTreningaDetalji && odabraniTrening"
              class="gumb-odradeno"
              :class="{ 'gumb-odradeno-aktivno': odradenoDanas }"
              :disabled="oznacavanje"
              @click="preklopiOdradeno"
            >
              {{ odradenoDanas ? 'Odrađeno danas' : 'Označi kao odrađeno danas' }}
            </button>
            <p v-if="ukupnoOdradeno > 0" class="trening-broj-odradeno">Ukupno odrađeno: {{ ukupnoOdradeno }} put(a)</p>

            <div v-if="ucitavanjeTreningaDetalji" class="ucitavanje"><div class="spinner"></div></div>
            <div v-else class="vjezbe-lista">
              <template v-for="(v, idx) in odabraniTrening?.vjezbe || []" :key="v._id">
                <div class="vjezba-kartica">
                  <div class="vjezba-naslov">{{ idx + 1 }}. {{ v.naziv }}</div>
                  <p v-if="v.opis" class="vjezba-opis">{{ v.opis }}</p>
                  <p v-if="v.serije" class="vjezba-detalji">
                    {{ v.serije }} serije po {{ v.ponavljanja }} ponavljanja<template v-if="v.kilaza"> sa {{ formatirajKilazu(v.kilaza) }}</template><template v-if="v.pauza"> · odmor {{ v.pauza }}s između serija</template>
                  </p>
                  <button v-if="v.video" class="gumb-video" @click="preklopiVideo(v._id)">
                    {{ otvoreniVideoId === v._id ? 'Sakrij video' : 'Pogledaj video' }}
                  </button>
                  <div v-if="otvoreniVideoId === v._id" class="video-wrap">
                    <iframe v-if="ugradbeniUrl(v.video)" :src="ugradbeniUrl(v.video)" frameborder="0" allowfullscreen></iframe>
                    <a v-else :href="v.video" target="_blank" rel="noopener noreferrer" class="video-link">Otvori video</a>
                  </div>
                </div>
                <div v-if="v.pauzaNakon && idx < odabraniTrening.vjezbe.length - 1" class="odmor-izmedju">
                  Odmor {{ v.pauzaNakon }}s prije sljedeće vježbe
                </div>
              </template>
            </div>
          </template>

          <template v-else-if="korak === 'razina'">
            <button class="gumb-nazad" @click="korak = 'kategorija'">‹ Nazad</button>
            <div class="razina-grid">
              <button v-for="r in razine" :key="r.kljuc" class="razina-kartica" @click="odaberiRazinu(r.kljuc)">
                <div class="razina-naziv">{{ r.naziv }}</div>
                <div class="razina-opis">{{ r.opis }}</div>
              </button>
            </div>
          </template>

          <template v-else-if="korak === 'lista'">
            <button class="gumb-nazad" @click="korak = 'razina'">‹ Nazad</button>
            <h2 class="lista-naslov">{{ nazivKategorije(odabranaKategorija) }} — {{ nazivRazine(odabranaRazina) }}</h2>
            <div v-if="!ucitavanjeVjezbi && procijenjenoTrajanjeListe" class="trening-info-traka">
              <span>Procijenjeno trajanje</span>
              <span>~{{ procijenjenoTrajanjeListe }} min</span>
            </div>

            <div v-if="ucitavanjeVjezbi" class="ucitavanje"><div class="spinner"></div></div>
            <div v-else-if="vjezbe.length === 0" class="prazno-vjezbe">Još nema vježbi u ovoj kategoriji i razini.</div>
            <div v-else class="vjezbe-lista">
              <div v-for="(v, idx) in vjezbe" :key="v._id" class="vjezba-kartica">
                <div class="vjezba-naslov">{{ idx + 1 }}. {{ v.naziv }}</div>
                <p v-if="v.opis" class="vjezba-opis">{{ v.opis }}</p>
                <p v-if="v.serije" class="vjezba-detalji">
                  {{ v.serije }} serije po {{ v.ponavljanja }} ponavljanja<template v-if="v.kilaza"> sa {{ formatirajKilazu(v.kilaza) }}</template><template v-if="v.pauza"> · odmor {{ v.pauza }}s</template>
                </p>
                <button v-if="v.video" class="gumb-video" @click="preklopiVideo(v._id)">
                  {{ otvoreniVideoId === v._id ? 'Sakrij video' : 'Pogledaj video' }}
                </button>
                <div v-if="otvoreniVideoId === v._id" class="video-wrap">
                  <iframe v-if="ugradbeniUrl(v.video)" :src="ugradbeniUrl(v.video)" frameborder="0" allowfullscreen></iframe>
                  <a v-else :href="v.video" target="_blank" rel="noopener noreferrer" class="video-link">Otvori video</a>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import api from '../services/api.js';

const router = useRouter();

const mobilniMeni = ref(false);
const ucitavanje = ref(false);
const brojUTeretani = ref(null);
const mojZahtjev = ref(null);
const istekla = ref(false);

const jePremium = computed(() => mojZahtjev.value?.status === 'odobreno' && mojZahtjev.value?.plan === 'premium' && !istekla.value);

const korak = ref('kategorija');
const kategorije = ref([]);
const razine = ref([]);
const ucitavanjeOpcije = ref(false);
const odabranaKategorija = ref('');
const odabranaRazina = ref('');
const vjezbe = ref([]);
const ucitavanjeVjezbi = ref(false);
const otvoreniVideoId = ref(null);

const treninzi = ref([]);
const ucitavanjeTreninga = ref(false);
const odabraniTrening = ref(null);
const ucitavanjeTreningaDetalji = ref(false);
const odradenoDanas = ref(false);
const ukupnoOdradeno = ref(0);
const oznacavanje = ref(false);

const RADNO_VRIJEME_PO_SERIJI = 40;
const ZADANA_PAUZA = 60;

function izracunajTrajanje(lista) {
  if (!lista || lista.length === 0) return null;
  const ukupnoSekundi = lista.reduce((zbroj, v) => {
    let vrijeme = v.pauzaNakon || 0;
    if (v.serije) {
      const pauza = v.pauza || ZADANA_PAUZA;
      vrijeme += v.serije * RADNO_VRIJEME_PO_SERIJI + (v.serije - 1) * pauza;
    }
    return zbroj + vrijeme;
  }, 0);
  if (ukupnoSekundi === 0) return null;
  return Math.round(ukupnoSekundi / 60);
}

const procijenjenoTrajanje = computed(() => izracunajTrajanje(odabraniTrening.value?.vjezbe));
const procijenjenoTrajanjeListe = computed(() => izracunajTrajanje(vjezbe.value));

function nazivKategorije(kljuc) {
  return kategorije.value.find(k => k.kljuc === kljuc)?.naziv || kljuc;
}

function nazivRazine(kljuc) {
  return razine.value.find(r => r.kljuc === kljuc)?.naziv || kljuc;
}

function formatirajKilazu(kilaza) {
  if (!kilaza) return '';
  return /^[\d.,\-\s]+$/.test(kilaza) ? `${kilaza} kg` : kilaza;
}

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

function preklopiVideo(id) {
  otvoreniVideoId.value = otvoreniVideoId.value === id ? null : id;
}

async function ucitajOpcije() {
  ucitavanjeOpcije.value = true;
  try {
    const { data } = await api.get('/vjezbe/opcije');
    kategorije.value = data.kategorije || [];
    razine.value = data.razine || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeOpcije.value = false;
  }
}

function odaberiKategoriju(kljuc) {
  odabranaKategorija.value = kljuc;
  korak.value = 'razina';
}

async function odaberiRazinu(kljuc) {
  odabranaRazina.value = kljuc;
  korak.value = 'lista';
  otvoreniVideoId.value = null;
  ucitavanjeVjezbi.value = true;
  try {
    const { data } = await api.get(`/vjezbe?kategorija=${odabranaKategorija.value}&razina=${kljuc}`);
    vjezbe.value = data.vjezbe || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeVjezbi.value = false;
  }
}

async function otvoriTreninge() {
  korak.value = 'treninzi';
  ucitavanjeTreninga.value = true;
  try {
    const { data } = await api.get('/treninzi');
    treninzi.value = data.treninzi || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeTreninga.value = false;
  }
}

async function otvoriTrening(id) {
  korak.value = 'trening-detalji';
  otvoreniVideoId.value = null;
  ucitavanjeTreningaDetalji.value = true;
  try {
    const { data } = await api.get(`/treninzi/${id}`);
    odabraniTrening.value = data.trening;
    odradenoDanas.value = data.odradenoDanas;
    ukupnoOdradeno.value = data.ukupnoOdradeno;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeTreningaDetalji.value = false;
  }
}

async function preklopiOdradeno() {
  if (!odabraniTrening.value) return;
  oznacavanje.value = true;
  try {
    const { data } = await api.post(`/treninzi/${odabraniTrening.value._id}/odradi`);
    odradenoDanas.value = data.odradenoDanas;
    ukupnoOdradeno.value = data.ukupnoOdradeno;
  } catch (err) {
    console.error(err);
  } finally {
    oznacavanje.value = false;
  }
}

async function ucitajMojZahtjev() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/clanarina/moja');
    mojZahtjev.value = data.zahtjev;
    istekla.value = data.istekla;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
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

onMounted(async () => {
  await ucitajMojZahtjev();
  ucitajBrojUTeretani();
  if (jePremium.value) ucitajOpcije();
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
.sadrzaj { padding: 1.5rem 2rem 2rem; max-width: 900px; width: 100%; margin: 0 auto; }

.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 90; display: none; }

.ucitavanje { display: flex; justify-content: center; padding: 4rem; width: 100%; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid rgba(245,200,0,0.2);
  border-top-color: #f5c800;
  border-radius: 50%;
  animation: rotacija 0.8s linear infinite;
}
@keyframes rotacija { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.zakljucano-kartica, .placeholder-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  width: 100%;
  margin: 1rem auto 0;
}

.zakljucano-kartica { border: 1px solid rgba(245,200,0,0.25); }

.zakljucano-ikona, .placeholder-ikona { font-size: 3rem; margin-bottom: 1rem; }

.zakljucano-naslov, .placeholder-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0 0 0.6rem;
  color: #f5c800;
}

.zakljucano-tekst, .placeholder-tekst {
  color: rgba(255,255,255,0.5);
  font-size: 0.92rem;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}
.placeholder-tekst { margin-bottom: 0; }

.gumb-nadogradi {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.8rem 1.75rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-nadogradi:hover { background: #ffd700; }

.gumb-nazad {
  background: none; border: none; color: rgba(255,255,255,0.5);
  font-size: 0.9rem; cursor: pointer; padding: 0; margin-bottom: 1.25rem;
  font-family: 'Barlow', sans-serif;
}
.gumb-nazad:hover { color: #f5c800; }

.kategorija-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
}

.kategorija-kartica {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(155deg, #2b2b2b, #1e1e1e);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  height: 150px;
  padding: 1.25rem 1rem;
  text-align: center;
  color: rgba(255,255,255,0.85);
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
}
.kategorija-kartica:hover { border-color: #f5c800; transform: translateY(-3px); }
.kategorija-kartica:hover .kategorija-kartica-label { color: #f5c800; }

.kategorija-kartica-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.razmak-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.35);
  text-align: center;
  margin: 2rem 0 1.25rem;
}

.trening-istaknuto {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(245,200,0,0.14), #1e1e1e 65%);
  border: 2px solid #f5c800;
  border-radius: 18px;
  padding: 2rem 2rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, transform 0.15s;
}
.trening-istaknuto:hover { background: linear-gradient(135deg, rgba(245,200,0,0.22), #1e1e1e 65%); transform: translateY(-2px); }

.trening-istaknuto-ikona {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(245,200,0,0.18);
  color: #f5c800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trening-istaknuto-tekst { position: relative; z-index: 1; flex: 1; min-width: 0; }

.trening-istaknuto-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #f5c800;
  margin-bottom: 0.35rem;
}

.trening-istaknuto-opis { color: rgba(255,255,255,0.65); font-size: 0.95rem; line-height: 1.5; margin: 0; }

.trening-istaknuto-strelica { position: relative; z-index: 1; font-size: 2.2rem; color: #f5c800; flex-shrink: 0; }

.treninzi-lista { display: flex; flex-direction: column; gap: 1rem; }

.trening-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.trening-kartica:hover { border-color: #f5c800; background: rgba(245,200,0,0.06); }

.trening-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.35rem;
}

.trening-opis { color: rgba(255,255,255,0.5); font-size: 0.88rem; margin: 0 0 0.5rem; line-height: 1.4; }
.trening-broj { color: #f5c800; font-size: 0.8rem; font-weight: 700; }

.trening-detalji-opis { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin: -0.75rem 0 1.25rem; }

.trening-info-traka {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 0.75rem 1.1rem;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 1rem;
}
.trening-info-traka span:last-child { color: #f5c800; font-weight: 700; }

.gumb-odradeno {
  display: block;
  width: 100%;
  background: transparent;
  border: 1px solid rgba(74,222,128,0.4);
  color: #4ade80;
  padding: 0.8rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
}
.gumb-odradeno:hover:not(:disabled) { background: rgba(74,222,128,0.1); }
.gumb-odradeno:disabled { opacity: 0.6; cursor: not-allowed; }
.gumb-odradeno-aktivno { background: rgba(74,222,128,0.15); }

.trening-broj-odradeno { color: rgba(255,255,255,0.4); font-size: 0.8rem; text-align: center; margin: 0 0 1.25rem; }

.razina-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.razina-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.75rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.razina-kartica:hover { border-color: #f5c800; background: rgba(245,200,0,0.06); }

.razina-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: #f5c800;
  margin-bottom: 0.35rem;
}

.razina-opis { font-size: 0.82rem; color: rgba(255,255,255,0.5); }

.lista-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #f5c800;
  margin: 0 0 1.25rem;
}

.prazno-vjezbe {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 2.5rem;
  text-align: center;
  color: rgba(255,255,255,0.35);
}

.vjezbe-lista { display: flex; flex-direction: column; gap: 1rem; }

.vjezba-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
}

.vjezba-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.vjezba-opis { color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.5; margin: 0 0 0.5rem; }
.vjezba-detalji { color: #f5c800; font-size: 0.85rem; font-weight: 700; margin: 0 0 0.75rem; }

.odmor-izmedju {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: rgba(255,255,255,0.4);
  font-size: 0.8rem;
  padding: 0.15rem 0;
}
.odmor-izmedju::before, .odmor-izmedju::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.08);
}

.gumb-video {
  background: transparent;
  border: 1px solid rgba(245,200,0,0.35);
  color: #f5c800;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-video:hover { background: rgba(245,200,0,0.1); }

.video-wrap { margin-top: 1rem; aspect-ratio: 16/9; }
.video-wrap iframe { width: 100%; height: 100%; border-radius: 10px; }
.video-link { color: #f5c800; font-size: 0.85rem; }

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
