<template>
  <div class="dashboard">

    <aside class="sidebar" :class="{ 'sidebar-open': mobilniMeni }">
      <div class="sidebar-logo">
        <img src="../assets/logo.png" alt="logo" class="logo-img" />
      </div>
      <nav class="sidebar-nav">
        <button class="nav-item active">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
          <span>IZAZOVI</span>
        </button>
      </nav>
      <div class="sidebar-korisnik">
        <div class="korisnik-inicijali">{{ inicijali }}</div>
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
        <h1 class="header-naslov">Izazovi</h1>
        <div></div>
      </header>

      <div v-if="korak === 'lista'" class="sadrzaj">
        <div class="tabovi">
          <button class="tab" :class="{ 'tab-aktivan': tab === 'aktivni' }" @click="tab = 'aktivni'">
            Pregled aktivnih izazova
          </button>
          <button class="tab" :class="{ 'tab-aktivan': tab === 'prosli' }" @click="tab = 'prosli'">
            Pregled prijašnjih izazova
          </button>
        </div>

        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else class="lista-kartica">
          <div v-if="prikazaniIzazovi.length === 0" class="prazno">
            Nema {{ tab === 'aktivni' ? 'aktivnih' : 'prijašnjih' }} izazova.
          </div>
          <div v-for="i in prikazaniIzazovi" :key="i._id" class="red-izazova" :class="{ 'red-prosli': tab === 'prosli' }">
            <div class="red-info">
              <span class="red-naziv">
                <span v-if="tab === 'aktivni'" class="lampica-aktivna" title="Aktivan"></span>
                {{ i.naziv }}
              </span>
              <span class="red-meta">{{ i.vrsta === 'tim' ? 'Timski' : 'Solo' }} · {{ i.nacin === 'dnevno' ? 'Dnevno' : 'Slobodno' }} · {{ formatirajDatum(i.pocetak) }} – {{ formatirajDatum(i.kraj) }}</span>
            </div>
            <div class="red-akcije">
              <button class="gumb-uredi" @click="otvoriUredjivanje(i)">Uredi</button>
              <button class="gumb-obrisi" @click="obrisiIzazov(i)" title="Obriši">✕</button>
            </div>
          </div>

          <button class="gumb-dodaj-novi" @click="korak = 'tip'">DODAJ NOVI</button>
        </div>
      </div>

      <div v-if="korak === 'tip'" class="sadrzaj">
        <button class="gumb-nazad" @click="korak = 'lista'">‹ Nazad</button>
        <div class="tip-grid">
          <button class="tip-kartica" @click="odaberiVrstu('solo')">
            <div class="tip-naslov">SOLO IZAZOVI</div>
            <p class="tip-opis">Svaki korisnik se natječe sam za sebe. Bodovi se računaju iz njegovih vlastitih aktivnosti nakon što se pridruži izazovu.</p>
          </button>
          <button class="tip-kartica" @click="odaberiVrstu('tim')">
            <div class="tip-naslov">TIMSKI IZAZOVI</div>
            <p class="tip-opis">Korisnici sami formiraju timove unutar izazova — tko napravi tim postaje kapetan i poziva ostale članove. Bodovi tima se računaju iz zbroja aktivnosti svih članova.</p>
          </button>
        </div>
      </div>

      <div v-if="korak === 'forma'" class="sadrzaj">
        <button class="gumb-nazad" @click="korak = uredjujeSeId ? 'lista' : 'tip'">‹ Nazad</button>

        <div class="forma-kartica">
          <div class="forma-red">
            <label class="forma-label">Naziv izazova</label>
            <input v-model="forma.naziv" class="forma-input" placeholder="npr. Ljetni izazov trčanja" />
          </div>

          <div class="forma-red">
            <label class="forma-label">Opis</label>
            <textarea v-model="forma.opis" class="forma-textarea" placeholder="Kratak opis izazova (opcionalno)"></textarea>
          </div>

          <div class="forma-red forma-red-dvije">
            <div>
              <label class="forma-label">Početak</label>
              <input v-model="forma.pocetak" type="date" lang="hr-HR" class="forma-input" />
            </div>
            <div>
              <label class="forma-label">Kraj</label>
              <input v-model="forma.kraj" type="date" lang="hr-HR" class="forma-input" />
            </div>
          </div>

          <div class="forma-red">
            <label class="forma-label">Vrsta izazova</label>
            <div class="vrsta-oznaka">{{ forma.vrsta === 'tim' ? 'Timski' : 'Solo' }}</div>
          </div>

          <div class="forma-red">
            <label class="forma-label">Način izazova</label>
            <div class="nacin-izbor">
              <button
                type="button"
                class="nacin-gumb"
                :class="{ 'nacin-aktivan': forma.nacin === 'kumulativno' }"
                @click="forma.nacin = 'kumulativno'"
              >
                Slobodno — tko više/bolje
              </button>
              <button
                type="button"
                class="nacin-gumb"
                :class="{ 'nacin-aktivan': forma.nacin === 'dnevno' }"
                @click="forma.nacin = 'dnevno'"
              >
                Dnevno — mora se raditi svaki dan
              </button>
            </div>
            <p class="nacin-opis">
              <template v-if="forma.nacin === 'dnevno'">
                Član mora ispuniti barem jedno od odabranih pravila svaki dan trajanja izazova. Ako preskoči dan, ispada iz izazova.
              </template>
              <template v-else>
                Nema dnevnog uvjeta — bodovi se skupljaju kroz cijelo trajanje izazova, pobjeđuje tko skupi najviše.
              </template>
            </p>
          </div>

          <div class="forma-red">
            <label class="forma-label">Aktivnosti u izazovu</label>
            <div class="aktivnosti-lista">
              <div v-for="t in TIPOVI" :key="t.tip" class="aktivnost-stavka">
                <label class="checkbox-red">
                  <input type="checkbox" v-model="uvjetiForma[t.tip].odabran" />
                  <span>{{ t.naziv }}</span>
                </label>

                <div v-if="uvjetiForma[t.tip].odabran" class="uvjet-sekcija">
                  <div v-for="(pravilo, idx) in uvjetiForma[t.tip].pravila" :key="idx" class="pravilo-blok">
                    <div class="uvjet-polja">
                      <div class="uvjet-polje">
                        <label>Mjera</label>
                        <select v-model="pravilo.mjera">
                          <option value="km">Kilometri</option>
                          <option value="vrijeme">Vrijeme (min)</option>
                          <option value="kalorije">Kalorije</option>
                          <option value="elevacija">Visinska razlika (m)</option>
                          <option value="broj">Broj aktivnosti</option>
                        </select>
                      </div>
                      <div class="uvjet-polje">
                        <label>Svakih (cilj)</label>
                        <input type="number" min="0" step="0.1" v-model.number="pravilo.cilj" placeholder="npr. 5" />
                      </div>
                      <div class="uvjet-polje">
                        <label>Bodova</label>
                        <input type="number" min="0" v-model.number="pravilo.bodovi" placeholder="npr. 5" />
                      </div>
                      <button
                        v-if="uvjetiForma[t.tip].pravila.length > 1"
                        class="gumb-ukloni-pravilo"
                        @click="ukloniPravilo(t.tip, idx)"
                        title="Ukloni pravilo"
                      >✕</button>
                    </div>
                    <div class="uvjet-napomena">{{ opisPravila(pravilo) }}</div>
                  </div>

                  <button class="gumb-dodaj-pravilo" @click="dodajPravilo(t.tip)">+ Dodaj dodatno pravilo (zbraja se)</button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="greska" class="poruka-greska">{{ greska }}</div>

          <button class="gumb-spremi" @click="spremiIzazov" :disabled="spremanje">
            {{ spremanje ? 'Spremam...' : (uredjujeSeId ? 'SPREMI PROMJENE' : 'DODAJ IZAZOV') }}
          </button>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';
import { formatirajDatum } from '../utils/aktivnosti.js';

const router = useRouter();
const auth = useAuthStore();

const TIPOVI = [
  { tip: 'Run', naziv: 'Trčanje' },
  { tip: 'Ride', naziv: 'Biciklizam' },
  { tip: 'Walk', naziv: 'Hodanje' },
  { tip: 'Swim', naziv: 'Plivanje' },
  { tip: 'Workout', naziv: 'Trening snage' },
];

function praznaPravilo() {
  return { mjera: 'km', cilj: null, bodovi: null };
}

function praznaUvjetiForma() {
  const obj = {};
  TIPOVI.forEach(t => {
    obj[t.tip] = { odabran: false, pravila: [praznaPravilo()] };
  });
  return obj;
}

function dodajPravilo(tip) {
  uvjetiForma[tip].pravila.push(praznaPravilo());
}

function ukloniPravilo(tip, idx) {
  uvjetiForma[tip].pravila.splice(idx, 1);
}

function opisPravila(pravilo) {
  const jed = jedinicaTeksta(pravilo.mjera);
  if (!pravilo.cilj || !pravilo.bodovi) return 'Unesi koliko jedinica donosi koliko bodova.';
  return `Svakih ${pravilo.cilj} ${jed} donosi ${pravilo.bodovi} bodova — ponavlja se (npr. ${pravilo.cilj * 2} ${jed} = ${pravilo.bodovi * 2} bodova). Manje od ${pravilo.cilj} ${jed} = 0 bodova za ovo pravilo.`;
}

const mobilniMeni = ref(false);
const korak = ref('lista');
const tab = ref('aktivni');
const ucitavanje = ref(false);
const spremanje = ref(false);
const greska = ref('');

const aktivniIzazovi = ref([]);
const prosliIzazovi = ref([]);
const uredjujeSeId = ref(null);

const forma = reactive({ naziv: '', opis: '', vrsta: 'solo', nacin: 'kumulativno', pocetak: '', kraj: '' });
const uvjetiForma = reactive(praznaUvjetiForma());

const inicijali = computed(() => {
  const ime = auth.korisnik?.ime || '';
  return ime.split(' ').map(r => r[0]).join('').toUpperCase().slice(0, 2);
});

const prikazaniIzazovi = computed(() => tab.value === 'aktivni' ? aktivniIzazovi.value : prosliIzazovi.value);

function jedinicaTeksta(mjera) {
  return { km: 'km', vrijeme: 'minuta', kalorije: 'kalorija', elevacija: 'm visinske razlike', broj: 'aktivnosti' }[mjera] || '';
}

async function ucitajIzazove() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/izazovi');
    aktivniIzazovi.value = data.aktivni || [];
    prosliIzazovi.value = data.prosli || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

function odaberiVrstu(vrsta) {
  Object.assign(forma, { naziv: '', opis: '', vrsta, nacin: 'kumulativno', pocetak: '', kraj: '' });
  Object.assign(uvjetiForma, praznaUvjetiForma());
  uredjujeSeId.value = null;
  greska.value = '';
  korak.value = 'forma';
}

function otvoriUredjivanje(izazov) {
  uredjujeSeId.value = izazov._id;
  Object.assign(forma, {
    naziv: izazov.naziv,
    opis: izazov.opis || '',
    vrsta: izazov.vrsta,
    nacin: izazov.nacin || 'kumulativno',
    pocetak: izazov.pocetak?.slice(0, 10),
    kraj: izazov.kraj?.slice(0, 10),
  });
  Object.assign(uvjetiForma, praznaUvjetiForma());
  (izazov.uvjeti || []).forEach(u => {
    if (!uvjetiForma[u.tip]) return;
    uvjetiForma[u.tip].odabran = true;
    if (uvjetiForma[u.tip].pravila.length === 1 && !uvjetiForma[u.tip].pravila[0].cilj) {
      uvjetiForma[u.tip].pravila = [];
    }
    uvjetiForma[u.tip].pravila.push({ mjera: u.mjera, cilj: u.cilj, bodovi: u.bodovi });
  });
  greska.value = '';
  korak.value = 'forma';
}

async function spremiIzazov() {
  greska.value = '';

  const odabraniTipovi = TIPOVI.filter(t => uvjetiForma[t.tip].odabran);

  const uvjeti = odabraniTipovi.flatMap(t =>
    uvjetiForma[t.tip].pravila
      .filter(p => p.cilj != null && p.cilj !== '' && p.bodovi != null && p.bodovi !== '')
      .map(p => ({ tip: t.tip, mjera: p.mjera, cilj: p.cilj, bodovi: p.bodovi }))
  );

  if (!forma.naziv.trim()) return (greska.value = 'Naziv je obavezan.');
  if (!forma.pocetak || !forma.kraj) return (greska.value = 'Odaberi početak i kraj izazova.');
  if (odabraniTipovi.length === 0) return (greska.value = 'Odaberi barem jednu aktivnost.');
  if (odabraniTipovi.some(t => !uvjeti.some(u => u.tip === t.tip))) {
    return (greska.value = 'Popuni barem jedno pravilo (cilj i bodove) za sve odabrane aktivnosti.');
  }

  spremanje.value = true;
  try {
    const payload = { ...forma, uvjeti };
    if (uredjujeSeId.value) {
      await api.put(`/izazovi/${uredjujeSeId.value}`, payload);
    } else {
      await api.post('/izazovi', payload);
    }
    await ucitajIzazove();
    korak.value = 'lista';
  } catch (err) {
    greska.value = err.response?.data?.poruka || 'Greška pri spremanju izazova.';
  } finally {
    spremanje.value = false;
  }
}

async function obrisiIzazov(izazov) {
  if (!confirm(`Sigurno želiš obrisati izazov "${izazov.naziv}"? Ovo se ne može poništiti.`)) return;
  try {
    await api.delete(`/izazovi/${izazov._id}`);
    await ucitajIzazove();
  } catch (err) {
    console.error(err);
  }
}

function handleOdjava() {
  auth.odjava();
  router.push('/prijava');
}

onMounted(() => {
  ucitajIzazove();
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
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #1a1a1a;
  color: #f5c800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.korisnik-info { display: flex; flex-direction: column; gap: 0.2rem; overflow: hidden; }
.korisnik-ime {
  color: #1a1a1a;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gumb-odjava { background: none; border: none; color: rgba(0,0,0,0.5); font-size: 0.8rem; cursor: pointer; padding: 0; font-family: 'Barlow', sans-serif; }
.gumb-odjava:hover { color: #1a1a1a; }

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 0.25rem; }
.hamburger span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; }

.header-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  margin: 0;
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

.red-izazova {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  transition: opacity 0.2s, filter 0.2s;
}
.red-izazova:last-of-type { border-bottom: none; }

.red-prosli { opacity: 0.5; filter: grayscale(1); }

.red-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.red-naziv {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.03em;
}
.red-meta { font-size: 0.82rem; color: rgba(255,255,255,0.4); }

.lampica-aktivna {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74,222,128,0.7);
  flex-shrink: 0;
}

.red-akcije { display: flex; gap: 0.5rem; flex-shrink: 0; }

.gumb-obrisi {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  width: 38px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}
.gumb-obrisi:hover { background: rgba(239,68,68,0.22); }

.gumb-uredi {
  background: rgba(245,200,0,0.12);
  border: 1px solid rgba(245,200,0,0.3);
  color: #f5c800;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.gumb-uredi:hover { background: rgba(245,200,0,0.22); }

.gumb-dodaj-novi {
  display: block;
  width: 100%;
  margin: 1.25rem 0;
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.9rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-dodaj-novi:hover { background: #ffd700; }

.gumb-nazad {
  background: none;
  border: none;
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1.25rem;
  font-family: 'Barlow', sans-serif;
}
.gumb-nazad:hover { color: #f5c800; }

.tip-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.tip-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.tip-kartica:hover { border-color: #f5c800; background: #2a2a2a; }

.tip-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: #f5c800;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.tip-opis { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.5; margin: 0; }

.forma-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.forma-red { display: flex; flex-direction: column; gap: 0.5rem; }
.forma-red-dvije { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.forma-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.06em;
}

.forma-input, .forma-textarea, .uvjet-polje select, .uvjet-polje input {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.65rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.92rem;
  width: 100%;
}
.forma-input:focus, .forma-textarea:focus, .uvjet-polje select:focus, .uvjet-polje input:focus {
  outline: none;
  border-color: #f5c800;
}
.forma-textarea { min-height: 70px; resize: vertical; }

.vrsta-oznaka {
  display: inline-block;
  background: rgba(245,200,0,0.12);
  color: #f5c800;
  border: 1px solid rgba(245,200,0,0.3);
  padding: 0.45rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  width: fit-content;
}

.nacin-izbor { display: flex; gap: 0.6rem; flex-wrap: wrap; }

.nacin-gumb {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.6);
  padding: 0.6rem 1.1rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.nacin-gumb:hover { border-color: rgba(245,200,0,0.4); }
.nacin-aktivan { background: rgba(245,200,0,0.12); border-color: #f5c800; color: #f5c800; }

.nacin-opis {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.4);
  margin: 0.6rem 0 0;
  line-height: 1.4;
}

.aktivnosti-lista { display: flex; flex-direction: column; gap: 0.5rem; }

.aktivnost-stavka {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

.checkbox-red {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
}
.checkbox-red input { width: 16px; height: 16px; accent-color: #f5c800; cursor: pointer; }

.uvjet-sekcija { margin-top: 0.85rem; display: flex; flex-direction: column; gap: 0.9rem; }

.pravilo-blok {
  padding: 0.85rem;
  background: #232323;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px;
}

.uvjet-polja {
  display: grid;
  grid-template-columns: repeat(3, 1fr) auto;
  gap: 0.75rem;
  align-items: end;
}

.uvjet-polje { display: flex; flex-direction: column; gap: 0.3rem; }
.uvjet-polje label { font-size: 0.72rem; color: rgba(255,255,255,0.4); letter-spacing: 0.04em; }

.gumb-ukloni-pravilo {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.gumb-ukloni-pravilo:hover { background: rgba(239,68,68,0.22); }

.gumb-dodaj-pravilo {
  align-self: flex-start;
  background: transparent;
  border: 1px dashed rgba(245,200,0,0.4);
  color: #f5c800;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-dodaj-pravilo:hover { background: rgba(245,200,0,0.1); }

.uvjet-napomena {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.35);
  margin-top: 0.5rem;
  line-height: 1.4;
}

.poruka-greska {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.gumb-spremi {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.9rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-spremi:hover:not(:disabled) { background: #ffd700; }
.gumb-spremi:disabled { opacity: 0.5; cursor: not-allowed; }

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
  .tip-grid { grid-template-columns: 1fr; }
  .forma-red-dvije { grid-template-columns: 1fr; }
  .uvjet-polja { grid-template-columns: 1fr 1fr; }
  .gumb-ukloni-pravilo { width: 100%; grid-column: 1 / -1; }
}
</style>
