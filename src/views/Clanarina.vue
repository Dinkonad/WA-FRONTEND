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
        <button class="nav-item active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
          <span>ČLANARINA</span>
        </button>
      </nav>
      <div class="sidebar-korisnik">
        <img v-if="auth.korisnik?.stravaProfilna" :src="auth.korisnik.stravaProfilna" class="korisnik-avatar" />
        <div v-else class="korisnik-inicijali">{{ inicijali }}</div>
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
        <h1 class="header-naslov">Članarina</h1>
        <div></div>
      </header>

      <div class="sadrzaj">
        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <template v-else-if="mojZahtjev && mojZahtjev.status === 'na_cekanju'">
          <div class="status-kartica">
            <div class="status-ikona">⏳</div>
            <h2 class="status-naslov">Zahtjev na čekanju</h2>
            <p class="status-tekst">
              {{ planovi[mojZahtjev.plan]?.naziv }} plan · {{ mojZahtjev.period === 'godisnje' ? 'godišnje' : 'mjesečno' }} · {{ mojZahtjev.cijena }} €
            </p>
            <p class="status-napomena">
              Vaša prijava je poslana knjigovodstvu na pregled, javit ćemo vam povratno kada prođe uplata.
            </p>
          </div>
        </template>

        <template v-else-if="mojZahtjev && mojZahtjev.status === 'odobreno' && !istekla">
          <div class="status-kartica">
            <div class="status-ikona">✅</div>
            <h2 class="status-naslov">Članarina odobrena!</h2>
            <p class="status-tekst">
              {{ planovi[mojZahtjev.plan]?.naziv }} plan · {{ mojZahtjev.period === 'godisnje' ? 'godišnje' : 'mjesečno' }} · {{ mojZahtjev.cijena }} €
            </p>
            <p class="status-napomena">Članarina vrijedi do {{ formatirajDatum(vrijediDo) }}.</p>
          </div>
        </template>

        <template v-else-if="mojZahtjev && mojZahtjev.status === 'odbijeno' && !zapoceoNoviZahtjev">
          <div class="status-kartica status-odbijeno">
            <div class="status-ikona">❌</div>
            <h2 class="status-naslov">Zahtjev odbijen</h2>
            <p v-if="mojZahtjev.napomenaOdbijanja" class="status-tekst">{{ mojZahtjev.napomenaOdbijanja }}</p>
            <button class="gumb-zuti" @click="zapoceoNoviZahtjev = true">Pošalji novi zahtjev</button>
          </div>
        </template>

        <template v-else-if="korak === 'plan'">
          <div v-if="mojZahtjev?.status === 'odobreno' && istekla" class="obavijest-isteklo">
            Tvoja članarina je istekla {{ formatirajDatum(vrijediDo) }}. Odaberi novi plan za nastavak.
          </div>

          <div class="period-izbor">
            <button class="period-gumb" :class="{ 'period-aktivan': period === 'mjesecno' }" @click="period = 'mjesecno'">Monthly</button>
            <button class="period-gumb" :class="{ 'period-aktivan': period === 'godisnje' }" @click="period = 'godisnje'">Yearly</button>
          </div>

          <div class="planovi-grid">
            <div v-for="(p, kljuc) in planovi" :key="kljuc" class="plan-kartica" :class="{ 'plan-istaknut': kljuc === 'basic' }">
              <div class="plan-naziv">{{ p.naziv.toUpperCase() }}</div>
              <div class="plan-cijena">
                {{ period === 'godisnje' ? p.mjesecno * 12 : p.mjesecno }}€<span class="plan-period">/{{ period === 'godisnje' ? 'god' : 'mo' }}</span>
              </div>
              <ul class="plan-znacajke">
                <li v-for="(z, i) in p.znacajke" :key="i">{{ z }}</li>
              </ul>
              <button class="gumb-plan" @click="odaberiPlan(kljuc)">Odaberi</button>
            </div>
          </div>
        </template>

        <template v-else-if="korak === 'info'">
          <button class="gumb-nazad" @click="korak = 'plan'">‹ Nazad</button>
          <div class="forma-kartica">
            <h2 class="forma-naslov">Članarina</h2>
            <div class="forma-red">
              <label class="forma-label">Ime i prezime</label>
              <input v-model="forma.imePrezime" class="forma-input" />
            </div>
            <div class="forma-red">
              <label class="forma-label">Godište</label>
              <input v-model.number="forma.godiste" type="number" class="forma-input" placeholder="npr. 1998" />
            </div>
            <div class="forma-red">
              <label class="forma-label">Spol</label>
              <select v-model="forma.spol" class="forma-input">
                <option value="">Odaberi</option>
                <option value="M">Muško</option>
                <option value="Ž">Žensko</option>
              </select>
            </div>
            <div class="forma-red">
              <label class="forma-label">Broj</label>
              <input v-model="forma.broj" class="forma-input" placeholder="broj telefona" />
            </div>
            <div v-if="greska" class="poruka-greska">{{ greska }}</div>
            <button class="gumb-zuti" @click="korak = 'placanje'">Nastavi</button>
          </div>
        </template>

        <template v-else-if="korak === 'placanje'">
          <button class="gumb-nazad" @click="korak = 'info'">‹ Nazad</button>
          <div class="placanje-kartica">
            <div class="barkod-wrap">
              <div class="barkod">
                <span v-for="(w, i) in barkodUzorak" :key="i" class="barkod-crta" :style="{ width: w + 'px' }"></span>
              </div>
            </div>
            <div class="iban-info">
              <div><b>IBAN:</b> {{ GYM_IBAN }}</div>
              <div><b>Iznos:</b> {{ odabraniPlan ? (period === 'godisnje' ? planovi[odabraniPlan].mjesecno * 12 : planovi[odabraniPlan].mjesecno) : 0 }} €</div>
              <div><b>Poziv na broj:</b> {{ auth.korisnik?._id?.slice(-8) }}</div>
              <div><b>Opis plaćanja:</b> Članarina {{ planovi[odabraniPlan]?.naziv }} — {{ auth.korisnik?.ime }}</div>
            </div>
            <p class="placanje-napomena">
              Uplati navedeni iznos na gornji IBAN, a zatim klikni "Pošalji na provjeru". Knjigovodstvo ručno provjerava uplatu na računu i javit će ti se s odgovorom.
            </p>
            <div v-if="greska" class="poruka-greska">{{ greska }}</div>
            <button class="gumb-zuti" :disabled="slanje" @click="posaljiZahtjev">
              {{ slanje ? 'Šaljem...' : 'Pošalji na provjeru' }}
            </button>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

const router = useRouter();
const auth = useAuthStore();

const GYM_IBAN = 'HR12 1234 5678 9012 3456 7';

const mobilniMeni = ref(false);
const brojUTeretani = ref(null);
const ucitavanje = ref(false);
const slanje = ref(false);
const greska = ref('');
const korak = ref('plan');
const period = ref('mjesecno');
const odabraniPlan = ref(null);
const planovi = ref({});
const mojZahtjev = ref(null);
const vrijediDo = ref(null);
const istekla = ref(false);
const zapoceoNoviZahtjev = ref(false);

const forma = ref({ imePrezime: '', godiste: null, spol: '', broj: '' });

const inicijali = computed(() => {
  const ime = auth.korisnik?.ime || '';
  return ime.split(' ').map(r => r[0]).join('').toUpperCase().slice(0, 2);
});

const barkodUzorak = computed(() => {
  const seme = (odabraniPlan.value || 'x').length + period.value.length;
  return Array.from({ length: 46 }, (_, i) => 1 + ((i * 7 + seme * 13) % 4));
});

function odaberiPlan(kljuc) {
  odabraniPlan.value = kljuc;
  forma.value.imePrezime = auth.korisnik?.ime || '';
  korak.value = 'info';
}

async function ucitajPlanove() {
  try {
    const { data } = await api.get('/clanarina/planovi');
    planovi.value = data.planovi || {};
  } catch (err) {
    console.error(err);
  }
}

function formatirajDatum(datum) {
  return new Date(datum).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function ucitajMojZahtjev() {
  try {
    const { data } = await api.get('/clanarina/moja');
    mojZahtjev.value = data.zahtjev;
    vrijediDo.value = data.vrijediDo;
    istekla.value = data.istekla;
  } catch (err) {
    console.error(err);
  }
}

async function posaljiZahtjev() {
  greska.value = '';
  if (!forma.value.imePrezime || !forma.value.godiste || !forma.value.spol || !forma.value.broj) {
    korak.value = 'info';
    greska.value = 'Popuni sva polja.';
    return;
  }

  slanje.value = true;
  try {
    const { data } = await api.post('/clanarina', {
      plan: odabraniPlan.value,
      period: period.value,
      ...forma.value,
    });
    mojZahtjev.value = data.zahtjev;
    vrijediDo.value = null;
    istekla.value = false;
  } catch (err) {
    greska.value = err.response?.data?.poruka || 'Greška pri slanju zahtjeva.';
  } finally {
    slanje.value = false;
  }
}

function handleOdjava() {
  auth.odjava();
  router.push('/prijava');
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
  ucitavanje.value = true;
  await Promise.all([ucitajPlanove(), ucitajMojZahtjev()]);
  ucitavanje.value = false;
  ucitajBrojUTeretani();
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

.sidebar-korisnik {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.korisnik-avatar { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(0,0,0,0.2); flex-shrink: 0; }
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
.sadrzaj { padding: 1.5rem 2rem 2rem; max-width: 780px; width: 100%; margin: 0 auto; }

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

.obavijest-isteklo {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.85rem 1.1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  text-align: center;
  max-width: 500px;
  margin: 0 auto 1.5rem;
}

.period-izbor {
  display: flex;
  gap: 0.4rem;
  justify-content: center;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 0.3rem;
  width: fit-content;
  margin: 0 auto 1.75rem;
}

.period-gumb {
  background: transparent;
  border: none;
  color: rgba(255,255,255,0.5);
  padding: 0.5rem 1.25rem;
  border-radius: 16px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.period-aktivan { background: #f5c800; color: #1a1a1a; }

.planovi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.plan-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-istaknut { background: #f5c800; }
.plan-istaknut .plan-naziv,
.plan-istaknut .plan-cijena,
.plan-istaknut .plan-znacajke { color: #1a1a1a; }

.plan-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fff;
}

.plan-cijena {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #f5c800;
}
.plan-period { font-size: 0.9rem; font-weight: 500; opacity: 0.6; }

.plan-znacajke {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.6);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.plan-znacajke li::before { content: '• '; }

.gumb-plan {
  background: #1a1a1a;
  color: #fff;
  border: none;
  padding: 0.7rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-plan:hover { background: #333; }
.plan-istaknut .gumb-plan { background: #1a1a1a; color: #f5c800; }

.gumb-nazad {
  background: none; border: none; color: rgba(255,255,255,0.5);
  font-size: 0.9rem; cursor: pointer; padding: 0; margin-bottom: 1.25rem;
  font-family: 'Barlow', sans-serif;
}
.gumb-nazad:hover { color: #f5c800; }

.forma-kartica, .placanje-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.75rem;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forma-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #f5c800;
  margin: 0 0 0.25rem;
}

.forma-red { display: flex; flex-direction: column; gap: 0.4rem; }
.forma-label { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
.forma-input {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.65rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.92rem;
}
.forma-input:focus { outline: none; border-color: #f5c800; }

.gumb-zuti {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.85rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-zuti:hover:not(:disabled) { background: #ffd700; }
.gumb-zuti:disabled { opacity: 0.5; cursor: not-allowed; }

.barkod-wrap { display: flex; justify-content: center; }
.barkod {
  background: #fff;
  padding: 1rem 1.25rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 1px;
  height: 60px;
}
.barkod-crta { background: #1a1a1a; height: 100%; display: inline-block; }

.iban-info {
  background: #1e1e1e;
  border-radius: 10px;
  padding: 1rem;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: rgba(255,255,255,0.8);
}

.placanje-napomena { font-size: 0.82rem; color: rgba(255,255,255,0.4); line-height: 1.5; }

.poruka-greska {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.status-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  max-width: 420px;
  margin: 2rem auto 0;
}
.status-odbijeno { border-color: rgba(239,68,68,0.3); }
.status-ikona { font-size: 2.5rem; margin-bottom: 1rem; }
.status-naslov { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 800; margin: 0 0 0.5rem; }
.status-tekst { color: rgba(255,255,255,0.6); margin: 0 0 0.75rem; }
.status-napomena { color: rgba(255,255,255,0.4); font-size: 0.85rem; line-height: 1.5; }
.status-kartica .gumb-zuti { margin-top: 1rem; width: 100%; }

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
  .planovi-grid { grid-template-columns: 1fr; }
}
</style>
