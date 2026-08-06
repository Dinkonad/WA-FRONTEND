<template>
  <div class="dashboard">

    <BocnaNavigacija aktivna="clanarina" :otvoren="mobilniMeni" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Članarina</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <template v-else-if="mojZahtjev && mojZahtjev.status === 'na_cekanju'">
          <div class="status-kartica">
            <h2 class="status-naslov">Zahtjev na čekanju</h2>
            <p class="status-tekst">
              {{ planovi[mojZahtjev.plan]?.naziv }} plan · {{ mojZahtjev.cijena }} €
            </p>
            <p v-if="mojZahtjev.nacinPlacanja === 'recepcija'" class="status-napomena">
              Dođi na recepciju teretane platiti gotovinom ili karticom kako bi ti se aktivirala članarina.
            </p>
            <p v-else class="status-napomena">
              Vaša prijava je poslana knjigovodstvu na pregled, javit ćemo vam povratno kada prođe uplata.
            </p>
          </div>
        </template>

        <template v-else-if="mojZahtjev && mojZahtjev.status === 'odobreno' && !istekla">
          <div class="status-kartica">
            <h2 class="status-naslov">Članarina odobrena</h2>
            <p class="status-tekst">
              {{ planovi[mojZahtjev.plan]?.naziv }} plan · {{ mojZahtjev.cijena }} €
            </p>
            <p class="status-napomena">Članarina vrijedi do {{ formatirajDatum(vrijediDo) }}.</p>
          </div>
        </template>

        <template v-else-if="mojZahtjev && mojZahtjev.status === 'odbijeno' && !zapoceoNoviZahtjev">
          <div class="status-kartica status-odbijeno">
            <h2 class="status-naslov">Zahtjev odbijen</h2>
            <p v-if="mojZahtjev.napomenaOdbijanja" class="status-tekst">{{ mojZahtjev.napomenaOdbijanja }}</p>
            <button class="gumb-zuti" @click="zapoceoNoviZahtjev = true">Pošalji novi zahtjev</button>
          </div>
        </template>

        <template v-else-if="korak === 'plan'">
          <div v-if="mojZahtjev?.status === 'odobreno' && istekla" class="obavijest-isteklo">
            Tvoja članarina je istekla {{ formatirajDatum(vrijediDo) }}. Odaberi novi plan za nastavak.
          </div>

          <div class="planovi-grid">
            <div v-for="(p, kljuc) in planovi" :key="kljuc" class="plan-kartica" :class="{ 'plan-istaknut': p.bestseller, 'plan-premium': p.premium }">
              <div v-if="p.bestseller" class="plan-znacka">NAJPOPULARNIJE</div>
              <div v-if="p.premium" class="plan-znacka plan-znacka-premium">PREMIUM</div>
              <div class="plan-naziv">{{ p.naziv.toUpperCase() }}</div>
              <div class="plan-cijena">
                {{ p.cijena }}€<span class="plan-period">/{{ trajanjeKratko(p.trajanjeDana) }}</span>
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
              <input v-model.number="forma.godiste" type="number" min="1900" :max="trenutnaGodina" class="forma-input" placeholder="npr. 1998" />
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
            <button class="gumb-zuti" @click="korak = 'nacin-placanja'">Nastavi</button>
          </div>
        </template>

        <template v-else-if="korak === 'nacin-placanja'">
          <button class="gumb-nazad" @click="korak = 'info'">‹ Nazad</button>
          <div class="forma-kartica">
            <h2 class="forma-naslov">Način plaćanja</h2>
            <button class="nacin-kartica" :disabled="slanje" @click="odaberiNacinPlacanja('uplatnica')">
              <div class="nacin-naslov">Uplata na račun</div>
              <p class="nacin-opis">Uplati na IBAN teretane, knjigovodstvo ručno potvrđuje uplatu.</p>
            </button>
            <button class="nacin-kartica" :disabled="slanje" @click="odaberiNacinPlacanja('recepcija')">
              <div class="nacin-naslov">Plati na recepciji</div>
              <p class="nacin-opis">Dođi u teretanu i plati gotovinom ili karticom izravno na recepciji.</p>
            </button>
            <div v-if="greska" class="poruka-greska">{{ greska }}</div>
          </div>
        </template>

        <template v-else-if="korak === 'placanje'">
          <button class="gumb-nazad" @click="korak = 'nacin-placanja'">‹ Nazad</button>
          <div class="placanje-kartica">
            <div class="barkod-wrap">
              <div class="barkod">
                <span v-for="(w, i) in barkodUzorak" :key="i" class="barkod-crta" :style="{ width: w + 'px' }"></span>
              </div>
            </div>
            <div class="iban-info">
              <div><b>IBAN:</b> {{ GYM_IBAN }}</div>
              <div><b>Iznos:</b> {{ odabraniPlan ? planovi[odabraniPlan].cijena : 0 }} €</div>
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
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import BocnaNavigacija from '../components/BocnaNavigacija.vue';

const router = useRouter();
const auth = useAuthStore();

const GYM_IBAN = 'HR12 1234 5678 9012 3456 7';

const mobilniMeni = ref(false);
const ucitavanje = ref(false);
const slanje = ref(false);
const greska = ref('');
const korak = ref('plan');
const odabraniPlan = ref(null);
const nacinPlacanjaOdabran = ref('uplatnica');
const planovi = ref({});
const mojZahtjev = ref(null);
const vrijediDo = ref(null);
const istekla = ref(false);
const zapoceoNoviZahtjev = ref(false);

const forma = ref({ imePrezime: '', godiste: null, spol: '', broj: '' });
const trenutnaGodina = new Date().getFullYear();


const barkodUzorak = computed(() => {
  const seme = (odabraniPlan.value || 'x').length;
  return Array.from({ length: 46 }, (_, i) => 1 + ((i * 7 + seme * 13) % 4));
});

function trajanjeKratko(dani) {
  if (dani === 1) return 'dan';
  if (dani === 7) return 'tjedan';
  return 'mj.';
}

function odaberiPlan(kljuc) {
  odabraniPlan.value = kljuc;
  forma.value.imePrezime = auth.korisnik?.ime || '';
  korak.value = 'info';
}

async function odaberiNacinPlacanja(nacin) {
  nacinPlacanjaOdabran.value = nacin;
  greska.value = '';
  if (nacin === 'uplatnica') {
    korak.value = 'placanje';
    return;
  }
  await posaljiZahtjev();
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
  if (forma.value.godiste < 1900 || forma.value.godiste > trenutnaGodina) {
    korak.value = 'info';
    greska.value = `Godište mora biti između 1900. i ${trenutnaGodina}.`;
    return;
  }

  slanje.value = true;
  try {
    const { data } = await api.post('/clanarina', {
      plan: odabraniPlan.value,
      nacinPlacanja: nacinPlacanjaOdabran.value,
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

onMounted(async () => {
  ucitavanje.value = true;
  await Promise.all([ucitajPlanove(), ucitajMojZahtjev()]);
  ucitavanje.value = false;
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

.planovi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 1.25rem;
}

.plan-kartica {
  position: relative;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-znacka {
  position: absolute;
  top: -0.7rem;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: #f5c800;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  white-space: nowrap;
}

.plan-znacka-premium { background: #4c1d95; color: #f5c800; }

.plan-istaknut { background: #f5c800; }
.plan-istaknut .plan-naziv,
.plan-istaknut .plan-cijena,
.plan-istaknut .plan-znacajke { color: #1a1a1a; }

.plan-premium {
  border: 2px solid #f5c800;
  background: linear-gradient(160deg, #2a2410, #252525 60%);
}

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

.nacin-kartica {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.nacin-kartica:hover:not(:disabled) { border-color: #f5c800; background: rgba(245,200,0,0.06); }
.nacin-kartica:disabled { opacity: 0.5; cursor: not-allowed; }

.nacin-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.35rem;
}

.nacin-opis { font-size: 0.82rem; color: rgba(255,255,255,0.5); margin: 0; line-height: 1.4; }

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
.status-naslov { font-family: 'Barlow Condensed', sans-serif; font-size: 1.4rem; font-weight: 800; margin: 0 0 0.5rem; }
.status-tekst { color: rgba(255,255,255,0.6); margin: 0 0 0.75rem; }
.status-napomena { color: rgba(255,255,255,0.4); font-size: 0.85rem; line-height: 1.5; }
.status-kartica .gumb-zuti { margin-top: 1rem; width: 100%; }

@media (max-width: 768px) {
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
  .sadrzaj { padding: 1rem 1rem 1.5rem; }
  .planovi-grid { grid-template-columns: 1fr; }
}
</style>
