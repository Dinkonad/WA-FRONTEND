<template>
  <div class="dashboard">

    <aside class="sidebar" :class="{ 'sidebar-open': mobilniMeni }">
      <div class="sidebar-logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item" :class="{ active: prikaz === 'statistika' }" @click="odaberiPrikaz('statistika')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          <span>STATISTIKA</span>
        </button>
        <button class="nav-item" :class="{ active: prikaz === 'prihod' }" @click="odaberiPrikaz('prihod')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          <span>PRIHOD</span>
        </button>
        <button class="nav-item" :class="{ active: prikaz === 'rashod' }" @click="odaberiPrikaz('rashod')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
          <span>RASHOD</span>
        </button>
        <button class="nav-item" :class="{ active: prikaz === 'clanarina' }" @click="odaberiPrikaz('clanarina')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/></svg>
          <span>ČLANARINA</span>
        </button>
      </nav>
    </aside>

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">{{ naslovi[prikaz] }}</h1>
        <OdjavaKrug />
      </header>

      <div v-if="prikaz === 'statistika'" class="sadrzaj">
        <div class="statistika-header">
          <div class="period-filter">
            <button v-for="p in periodi" :key="p.kljuc" class="period-gumb" :class="{ 'period-aktivan': statPeriod === p.kljuc }" @click="statPeriod = p.kljuc">
              {{ p.naziv }}
            </button>
          </div>
          <button class="gumb-izvoz" @click="izvezi">⬇ Izvezi CSV</button>
        </div>

        <div v-if="ucitavanjeStat" class="ucitavanje"><div class="spinner"></div></div>

        <template v-else-if="statistika">
          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-broj stat-prihod">{{ statistika.ukupnoPrihod.toFixed(0) }} €</div>
              <div class="stat-label">Prihod</div>
            </div>
            <div class="stat-box">
              <div class="stat-broj stat-rashod">{{ statistika.ukupnoRashod.toFixed(0) }} €</div>
              <div class="stat-label">Rashod</div>
            </div>
            <div class="stat-box">
              <div class="stat-broj" :class="statistika.neto >= 0 ? 'stat-prihod' : 'stat-rashod'">{{ statistika.neto.toFixed(0) }} €</div>
              <div class="stat-label">Neto</div>
            </div>
          </div>

          <div class="bar-chart-kartica">
            <div class="bar-chart-naslov">PRIHOD I RASHOD</div>
            <div class="bar-chart">
              <div v-for="(b, idx) in statistika.bucketi" :key="idx" class="bar-col">
                <div class="bar-wrap bar-wrap-dvostruko">
                  <div class="bar bar-prihod" :style="{ height: postotakVisine(b.prihod) + '%' }" :title="`Prihod: ${b.prihod.toFixed(0)} €`"></div>
                  <div class="bar bar-rashod" :style="{ height: postotakVisine(b.rashod) + '%' }" :title="`Rashod: ${b.rashod.toFixed(0)} €`"></div>
                </div>
                <div class="bar-dan">{{ b.oznaka }}</div>
              </div>
            </div>
            <div class="bar-legenda">
              <span><span class="legenda-tocka legenda-prihod"></span>Prihod</span>
              <span><span class="legenda-tocka legenda-rashod"></span>Rashod</span>
            </div>
          </div>

          <div v-if="statistika.rashodBreakdown.length > 0" class="breakdown-kartica">
            <div class="bar-chart-naslov">RASHOD PO KATEGORIJI</div>
            <div v-for="r in statistika.rashodBreakdown" :key="r.kategorija" class="breakdown-red">
              <div class="breakdown-info">
                <span>{{ r.kategorija }}</span>
                <span>{{ r.iznos.toFixed(0) }} € · {{ r.postotak }}%</span>
              </div>
              <div class="breakdown-traka-pozadina">
                <div class="breakdown-traka" :style="{ width: r.postotak + '%' }"></div>
              </div>
            </div>
          </div>
        </template>

        <div class="sekcija-naslov">AKTIVNI ČLANOVI</div>
        <div v-if="ucitavanjeRetencija" class="ucitavanje"><div class="spinner"></div></div>
        <template v-else-if="retencija">
          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-broj stat-prihod">{{ retencija.aktivnih }}</div>
              <div class="stat-label">Aktivnih članova</div>
            </div>
            <div class="stat-box">
              <div class="stat-broj stat-rashod">{{ retencija.istekli }}</div>
              <div class="stat-label">Isteklo, nije obnovljeno</div>
            </div>
            <div class="stat-box">
              <div class="stat-broj">{{ retencija.naCekanju }}</div>
              <div class="stat-label">Na čekanju</div>
            </div>
          </div>

          <div v-if="retencija.churnLista.length > 0" class="breakdown-kartica">
            <div class="bar-chart-naslov">ČLANOVI KOJI NISU OBNOVILI ČLANARINU</div>
            <div v-for="c in retencija.churnLista" :key="c.email || c.ime" class="churn-red">
              <div class="churn-info">
                <span class="churn-ime">{{ c.ime }}</span>
                <span class="churn-detalji">{{ c.plan.toUpperCase() }} · isteklo {{ formatirajDatum(c.istekaoDatum) }}</span>
              </div>
              <span class="churn-dana">{{ c.danaOdIsteka }} {{ c.danaOdIsteka === 1 ? 'dan' : 'dana' }}</span>
            </div>
          </div>
          <div v-else class="prazno-manje">Svi članovi su ažurni — nitko nije istekao bez obnove.</div>
        </template>

        <div class="sekcija-naslov">ISKORIŠTENOST PO PLANU <span v-if="iskoristenost">(zadnjih {{ iskoristenost.prozorDana }} dana)</span></div>
        <div v-if="ucitavanjeIskoristenost" class="ucitavanje"><div class="spinner"></div></div>
        <template v-else-if="iskoristenost">
          <div v-if="iskoristenost.podaciPoPlanu.length === 0" class="prazno-manje">Nema aktivnih članova.</div>
          <div v-else class="lista-kartica">
            <div v-for="p in iskoristenost.podaciPoPlanu" :key="p.plan" class="plan-red">
              <div class="plan-naziv">{{ p.plan.toUpperCase() }}</div>
              <div class="plan-detalji">
                <span>{{ p.brojClanova }} {{ p.brojClanova === 1 ? 'član' : 'člana' }}</span>
                <span>{{ p.ukupnoUlazaka }} ulazaka</span>
                <span>{{ p.prosjecnoUlazakaPoClanu }} posjeta/članu</span>
                <span v-if="p.cijenaPoPosjeti !== null">{{ p.cijenaPoPosjeti }} €/posjeti</span>
              </div>
            </div>
          </div>
          <p v-if="iskoristenost.prosjecnaCijenaPoPosjeti !== null" class="prosjek-tekst">
            Prosječna cijena po posjeti (svi planovi): <strong>{{ iskoristenost.prosjecnaCijenaPoPosjeti }} €</strong>
          </p>
        </template>
      </div>

      <div v-else-if="prikaz === 'prihod' || prikaz === 'rashod'" class="sadrzaj">
        <button class="gumb-dodaj-financiju" @click="otvoriFormu(prikaz)">+ Dodaj {{ prikaz === 'prihod' ? 'prihod' : 'rashod' }}</button>

        <div v-if="formaOtvorenaZa === prikaz" class="forma-financije">
          <div class="forma-red-financije">
            <label>Ime</label>
            <input v-model="forma.ime" placeholder="npr. Marko Marković" />
          </div>
          <div class="forma-red-financije">
            <label>Kategorija</label>
            <select v-model="forma.kategorija">
              <option v-for="k in kategorije[prikaz]" :key="k" :value="k">{{ k }}</option>
            </select>
            <input v-if="forma.kategorija === 'Ostalo'" v-model="forma.kategorijaOstalo" placeholder="Upiši novu kategoriju" class="forma-input-ostalo" />
          </div>
          <div class="forma-red-financije">
            <label>Iznos (€)</label>
            <input v-model.number="forma.iznos" type="number" min="0" step="0.01" placeholder="0.00" />
          </div>
          <div class="forma-red-financije">
            <label>Opis</label>
            <input v-model="forma.opis" placeholder="opcionalno" />
          </div>
          <div class="forma-red-financije">
            <label>Datum</label>
            <input v-model="forma.datum" type="date" lang="hr-HR" />
          </div>
          <div v-if="formaGreska" class="poruka-greska">{{ formaGreska }}</div>
          <div class="forma-akcije">
            <button class="gumb-potvrdi-odbijanje" :disabled="spremanjeFinancije" @click="posaljiFinanciju(prikaz)">
              {{ spremanjeFinancije ? 'Spremam...' : 'Spremi' }}
            </button>
            <button class="gumb-otkazi-odbijanje" @click="formaOtvorenaZa = null">Odustani</button>
          </div>
        </div>

        <div v-if="ucitavanjeFinancije" class="ucitavanje"><div class="spinner"></div></div>
        <div v-else class="lista-kartica">
          <div v-if="financije.length === 0" class="prazno">Nema unesenih stavki.</div>
          <div v-for="f in financije" :key="f._id" class="red-financije">
            <div class="financija-info">
              <div class="financija-glavno">
                <span class="financija-ime">{{ f.ime }}</span>
                <span class="financija-iznos" :class="prikaz === 'prihod' ? 'stat-prihod' : 'stat-rashod'">
                  {{ prikaz === 'prihod' ? '+' : '−' }}{{ f.iznos.toFixed(2) }} €
                </span>
              </div>
              <div class="financija-detalji">
                <span>{{ f.kategorija }}</span>
                <span>{{ formatirajDatum(f.datum) }}</span>
                <span v-if="f.automatski" class="oznaka-automatski">Automatski (članarina)</span>
              </div>
              <p v-if="f.opis" class="financija-opis">{{ f.opis }}</p>
            </div>
            <button class="gumb-obrisi" @click="obrisiFinanciju(f)" title="Obriši">✕</button>
          </div>
        </div>
      </div>

      <div v-else class="sadrzaj">
        <div class="tabovi">
          <button class="tab" :class="{ 'tab-aktivan': tab === 'na_cekanju' }" @click="tab = 'na_cekanju'">Na čekanju</button>
          <button class="tab" :class="{ 'tab-aktivan': tab === 'odobreno' }" @click="tab = 'odobreno'">Odobreno</button>
          <button class="tab" :class="{ 'tab-aktivan': tab === 'odbijeno' }" @click="tab = 'odbijeno'">Odbijeno</button>
        </div>

        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-if="zahtjevi.length === 0" class="prazno">Nema zahtjeva u ovoj kategoriji.</div>

          <div v-for="z in zahtjevi" :key="z._id" class="red-zahtjeva">
            <div class="zahtjev-info">
              <div class="zahtjev-glavno">
                <span class="zahtjev-ime">{{ z.korisnikId?.ime || z.imePrezime }}</span>
                <span class="zahtjev-plan">{{ z.plan.toUpperCase() }} · {{ z.cijena }} €</span>
              </div>
              <div class="zahtjev-detalji">
                <span>{{ z.korisnikId?.email }}</span>
                <span>Godište: {{ z.godiste }}</span>
                <span>Spol: {{ z.spol }}</span>
                <span>Broj: {{ z.broj }}</span>
                <span>Poslano: {{ formatirajDatum(z.createdAt) }}</span>
              </div>
              <p v-if="z.status === 'odbijeno' && z.napomenaOdbijanja" class="zahtjev-napomena">Razlog: {{ z.napomenaOdbijanja }}</p>
            </div>

            <div class="zahtjev-akcije">
              <template v-if="z.status === 'na_cekanju'">
                <button class="gumb-odobri" :disabled="obradujem === z._id" @click="odobri(z)">Odobri</button>
                <button class="gumb-odbij" :disabled="obradujem === z._id" @click="otvoriOdbijanje(z)">Odbij</button>
              </template>
              <button class="gumb-obrisi" :disabled="obradujem === z._id" @click="obrisi(z)" title="Obriši">✕</button>
            </div>

            <div v-if="otvoreniOdbij === z._id" class="odbijanje-forma">
              <input
                v-model="napomenaUnos"
                class="odbijanje-input"
                placeholder="Razlog odbijanja (opcionalno)"
                @keyup.enter="potvrdiOdbijanje(z)"
              />
              <button class="gumb-potvrdi-odbijanje" :disabled="obradujem === z._id" @click="potvrdiOdbijanje(z)">Potvrdi</button>
              <button class="gumb-otkazi-odbijanje" @click="otvoreniOdbij = null">Odustani</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import api from '../services/api.js';
import OdjavaKrug from '../components/OdjavaKrug.vue';
import { potvrdi } from '../composables/potvrda.js';

const mobilniMeni = ref(false);
const prikaz = ref('statistika');

const naslovi = { statistika: 'Statistika', prihod: 'Prihod', rashod: 'Rashod', clanarina: 'Članarina' };

function formatirajDatum(datum) {
  const d = new Date(datum);
  const dan = String(d.getDate()).padStart(2, '0');
  const mjesec = String(d.getMonth() + 1).padStart(2, '0');
  return `${dan}/${mjesec}/${d.getFullYear()}`;
}

const zahtjeviUcitani = ref(false);

function odaberiPrikaz(novi) {
  prikaz.value = novi;
  if ((novi === 'prihod' || novi === 'rashod') && financijeUcitaneZa.value !== novi) ucitajFinancije(novi);
  if (novi === 'statistika' && !statistika.value) ucitajCijeluStatistiku();
  if (novi === 'clanarina' && !zahtjeviUcitani.value) ucitajZahtjeve();
}

const tab = ref('na_cekanju');
const ucitavanje = ref(false);
const zahtjevi = ref([]);
const obradujem = ref(null);
const otvoreniOdbij = ref(null);
const napomenaUnos = ref('');

async function ucitajZahtjeve() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get(`/clanarina?status=${tab.value}`);
    zahtjevi.value = data.zahtjevi || [];
    zahtjeviUcitani.value = true;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

async function odobri(z) {
  obradujem.value = z._id;
  try {
    await api.put(`/clanarina/${z._id}/odobri`);
    zahtjevi.value = zahtjevi.value.filter(x => x._id !== z._id);
    poništiPredmemoriju();
  } catch (err) {
    console.error(err);
  } finally {
    obradujem.value = null;
  }
}

function otvoriOdbijanje(z) {
  otvoreniOdbij.value = z._id;
  napomenaUnos.value = '';
}

async function potvrdiOdbijanje(z) {
  obradujem.value = z._id;
  try {
    await api.put(`/clanarina/${z._id}/odbij`, { napomena: napomenaUnos.value });
    zahtjevi.value = zahtjevi.value.filter(x => x._id !== z._id);
    otvoreniOdbij.value = null;
  } catch (err) {
    console.error(err);
  } finally {
    obradujem.value = null;
  }
}

async function obrisi(z) {
  if (!(await potvrdi(`Sigurno obrisati zahtjev za "${z.korisnikId?.ime || z.imePrezime}"? Ovo se ne može poništiti.`))) return;
  obradujem.value = z._id;
  try {
    await api.delete(`/clanarina/${z._id}`);
    zahtjevi.value = zahtjevi.value.filter(x => x._id !== z._id);
  } catch (err) {
    console.error(err);
  } finally {
    obradujem.value = null;
  }
}

watch(tab, ucitajZahtjeve);

const kategorije = ref({ prihod: [], rashod: [] });
const financije = ref([]);
const financijeUcitaneZa = ref(null);
const ucitavanjeFinancije = ref(false);
const formaOtvorenaZa = ref(null);
const formaGreska = ref('');
const spremanjeFinancije = ref(false);

function praznaForma() {
  return { ime: '', kategorija: '', kategorijaOstalo: '', iznos: null, opis: '', datum: new Date().toISOString().slice(0, 10) };
}
const forma = ref(praznaForma());

async function ucitajKategorije() {
  try {
    const { data } = await api.get('/financije/kategorije');
    kategorije.value = data.kategorije;
  } catch (err) {
    console.error(err);
  }
}

async function ucitajFinancije(vrsta) {
  ucitavanjeFinancije.value = true;
  try {
    const { data } = await api.get(`/financije?vrsta=${vrsta}`);
    financije.value = data.stavke || [];
    financijeUcitaneZa.value = vrsta;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeFinancije.value = false;
  }
}

function otvoriFormu(vrsta) {
  formaOtvorenaZa.value = vrsta;
  formaGreska.value = '';
  forma.value = praznaForma();
  forma.value.kategorija = kategorije.value[vrsta]?.[0] || '';
}

async function posaljiFinanciju(vrsta) {
  formaGreska.value = '';
  const kategorijaKonacna = forma.value.kategorija === 'Ostalo' && forma.value.kategorijaOstalo.trim()
    ? forma.value.kategorijaOstalo.trim()
    : forma.value.kategorija;

  if (!forma.value.ime.trim()) return (formaGreska.value = 'Upiši ime.');
  if (!kategorijaKonacna) return (formaGreska.value = 'Odaberi kategoriju.');
  if (!forma.value.iznos || forma.value.iznos <= 0) return (formaGreska.value = 'Upiši iznos.');
  if (!forma.value.datum) return (formaGreska.value = 'Odaberi datum.');

  spremanjeFinancije.value = true;
  try {
    await api.post('/financije', {
      vrsta,
      kategorija: kategorijaKonacna,
      ime: forma.value.ime.trim(),
      iznos: forma.value.iznos,
      opis: forma.value.opis,
      datum: forma.value.datum,
    });
    formaOtvorenaZa.value = null;
    await ucitajFinancije(vrsta);
  } catch (err) {
    formaGreska.value = err.response?.data?.poruka || 'Greška pri spremanju.';
  } finally {
    spremanjeFinancije.value = false;
  }
}

async function obrisiFinanciju(f) {
  if (!(await potvrdi(`Obrisati stavku "${f.ime}"?`))) return;
  try {
    await api.delete(`/financije/${f._id}`);
    financije.value = financije.value.filter(x => x._id !== f._id);
  } catch (err) {
    console.error(err);
  }
}

const statPeriod = ref('mjesecno');
const ucitavanjeStat = ref(false);
const statistika = ref(null);
const periodi = [
  { kljuc: 'tjedno', naziv: 'Tjedno' },
  { kljuc: 'mjesecno', naziv: 'Mjesečno' },
  { kljuc: 'godisnje', naziv: 'Godišnje' },
];

async function ucitajStatistiku() {
  ucitavanjeStat.value = true;
  try {
    const { data } = await api.get(`/financije/statistika?period=${statPeriod.value}`);
    statistika.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeStat.value = false;
  }
}

const maxBucketVrijednost = computed(() => {
  if (!statistika.value) return 1;
  const sve = statistika.value.bucketi.flatMap(b => [b.prihod, b.rashod]);
  return Math.max(...sve, 1);
});

function postotakVisine(vrijednost) {
  return Math.round((vrijednost / maxBucketVrijednost.value) * 100);
}

watch(statPeriod, ucitajStatistiku);

const retencija = ref(null);
const ucitavanjeRetencija = ref(false);

async function ucitajRetenciju() {
  ucitavanjeRetencija.value = true;
  try {
    const { data } = await api.get('/clanarina/retencija');
    retencija.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeRetencija.value = false;
  }
}

const iskoristenost = ref(null);
const ucitavanjeIskoristenost = ref(false);

async function ucitajIskoristenost() {
  ucitavanjeIskoristenost.value = true;
  try {
    const { data } = await api.get('/clanarina/iskoristenost');
    iskoristenost.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeIskoristenost.value = false;
  }
}

function ucitajCijeluStatistiku() {
  ucitajStatistiku();
  ucitajRetenciju();
  ucitajIskoristenost();
}

function poništiPredmemoriju() {
  financijeUcitaneZa.value = null;
  statistika.value = null;
  retencija.value = null;
  iskoristenost.value = null;
}

async function izvezi() {
  try {
    const odgovor = await api.get(`/financije/export?period=${statPeriod.value}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([odgovor.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financije-${statPeriod.value}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  ucitajKategorije();
  ucitajCijeluStatistiku();
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

.sidebar-korisnik {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

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
.sadrzaj { padding: 1.5rem 2rem 2rem; max-width: 800px; width: 100%; margin: 0 auto; }

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

.tabovi { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.tab {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-aktivan { background: #f5c800; border-color: #f5c800; color: #1a1a1a; }

.lista-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 0.5rem 1.5rem;
}

.prazno { padding: 2.5rem; text-align: center; color: rgba(255,255,255,0.25); font-size: 0.95rem; }

.red-zahtjeva {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.red-zahtjeva:last-of-type { border-bottom: none; }

.zahtjev-info { display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
.zahtjev-glavno { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
.zahtjev-ime {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
}
.zahtjev-plan { font-size: 0.82rem; color: #f5c800; font-weight: 700; }

.zahtjev-detalji {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
}

.zahtjev-napomena { font-size: 0.82rem; color: #fca5a5; margin: 0; }

.zahtjev-akcije { display: flex; gap: 0.5rem; flex-shrink: 0; }

.odbijanje-forma {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.odbijanje-input {
  flex: 1;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.55rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.85rem;
}
.odbijanje-input:focus { outline: none; border-color: #f5c800; }

.gumb-potvrdi-odbijanje {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
}
.gumb-potvrdi-odbijanje:disabled { opacity: 0.5; cursor: not-allowed; }

.gumb-otkazi-odbijanje {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  flex-shrink: 0;
}
.gumb-otkazi-odbijanje:hover { color: #fff; }

.gumb-odobri {
  background: rgba(74,222,128,0.15);
  border: 1px solid rgba(74,222,128,0.35);
  color: #4ade80;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-odobri:hover:not(:disabled) { background: rgba(74,222,128,0.25); }

.gumb-odbij {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-odbij:hover:not(:disabled) { background: rgba(239,68,68,0.22); }

.gumb-obrisi {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.4);
  width: 38px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: border-color 0.2s, color 0.2s;
  flex-shrink: 0;
}
.gumb-obrisi:hover:not(:disabled) { border-color: #fca5a5; color: #fca5a5; }

.gumb-odobri:disabled, .gumb-odbij:disabled, .gumb-obrisi:disabled { opacity: 0.5; cursor: not-allowed; }

.poruka-greska {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}


.gumb-dodaj-financiju {
  display: block;
  width: 100%;
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.85rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  cursor: pointer;
  margin-bottom: 1.25rem;
  transition: background 0.2s;
}
.gumb-dodaj-financiju:hover { background: #ffd700; }

.forma-financije {
  background: #252525;
  border: 1px solid rgba(245,200,0,0.25);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.forma-red-financije { display: flex; flex-direction: column; gap: 0.4rem; }
.forma-red-financije label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.04em;
}

.forma-red-financije input,
.forma-red-financije select {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.65rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.9rem;
}
.forma-red-financije input:focus,
.forma-red-financije select:focus { outline: none; border-color: #f5c800; }

.forma-input-ostalo { margin-top: 0.5rem; }

.forma-akcije { display: flex; gap: 0.5rem; }

.red-financije {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.red-financije:last-of-type { border-bottom: none; }

.financija-info { display: flex; flex-direction: column; gap: 0.35rem; min-width: 0; }
.financija-glavno { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; }
.financija-ime {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.02rem;
}
.financija-iznos { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1rem; }

.financija-detalji {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
}

.oznaka-automatski {
  background: rgba(245,200,0,0.12);
  color: #f5c800;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.72rem;
  font-weight: 700;
}

.financija-opis { font-size: 0.82rem; color: rgba(255,255,255,0.5); margin: 0; }

.stat-prihod { color: #4ade80; }
.stat-rashod { color: #f87171; }


.statistika-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}
.statistika-header .period-filter { margin-bottom: 0; }

.gumb-izvoz {
  background: transparent;
  border: 1px solid rgba(245,200,0,0.35);
  color: #f5c800;
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.gumb-izvoz:hover { background: rgba(245,200,0,0.12); }

.sekcija-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff;
  margin: 2.25rem 0 1rem;
}
.sekcija-naslov span {
  font-family: 'Barlow', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255,255,255,0.4);
  letter-spacing: normal;
}

.prazno-manje {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.5rem;
  text-align: center;
  color: rgba(255,255,255,0.35);
  font-size: 0.9rem;
}

.churn-red {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.churn-red:last-child { border-bottom: none; padding-bottom: 0; }

.churn-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.churn-ime { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.98rem; }
.churn-detalji { font-size: 0.78rem; color: rgba(255,255,255,0.4); }
.churn-dana {
  flex-shrink: 0;
  background: rgba(239,68,68,0.12);
  color: #fca5a5;
  padding: 0.3rem 0.7rem;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: 'Barlow Condensed', sans-serif;
}

.plan-red {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.plan-red:last-of-type { border-bottom: none; }

.plan-naziv { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1rem; color: #f5c800; }

.plan-detalji {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem 1.1rem;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.6);
}

.prosjek-tekst {
  text-align: center;
  color: rgba(255,255,255,0.5);
  font-size: 0.85rem;
  margin-top: 1rem;
}
.prosjek-tekst strong { color: #f5c800; }

.period-filter { display: flex; gap: 0.6rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.period-gumb {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.5);
  padding: 0.6rem 1.5rem;
  border-radius: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s;
}
.period-gumb:hover { border-color: rgba(245,200,0,0.3); color: #fff; }
.period-aktivan { background: #f5c800; border-color: #f5c800; color: #1a1a1a; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat-box {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 1.1rem 1rem;
}

.stat-broj {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
}

.stat-label {
  color: rgba(255,255,255,0.4);
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.bar-chart-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.bar-chart-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.1em;
  margin-bottom: 1.25rem;
}

.bar-chart {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  height: 160px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.bar-wrap-dvostruko {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  background: rgba(255,255,255,0.04);
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  min-height: 80px;
}

.bar {
  width: 100%;
  border-radius: 3px 3px 0 0;
  transition: height 0.4s ease;
  min-height: 2px;
}

.bar-prihod { background: #4ade80; }
.bar-rashod { background: #f87171; }

.bar-dan {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}

.bar-legenda {
  display: flex;
  gap: 1.25rem;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.5);
}
.bar-legenda span { display: flex; align-items: center; gap: 0.4rem; }

.legenda-tocka { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.legenda-prihod { background: #4ade80; }
.legenda-rashod { background: #f87171; }

.breakdown-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.5rem;
}

.breakdown-red { margin-bottom: 1rem; }
.breakdown-red:last-child { margin-bottom: 0; }

.breakdown-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.4rem;
}

.breakdown-traka-pozadina {
  background: rgba(255,255,255,0.06);
  border-radius: 6px;
  height: 8px;
  overflow: hidden;
}

.breakdown-traka {
  background: #f87171;
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s ease;
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
  .sadrzaj { padding: 1rem 1rem 1.5rem; }
  .red-zahtjeva { flex-direction: column; }
  .zahtjev-akcije { width: 100%; }
  .gumb-odobri, .gumb-odbij { flex: 1; }
  .stats-row { grid-template-columns: 1fr; }
}
</style>
