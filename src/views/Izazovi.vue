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
        <button class="nav-item active">
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
        <button class="nav-item" @click="router.push('/treninzi')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5 17.5 17.5M8 4l-4 4 12 12 4-4z"/><path d="M2 22l3-3M16 8l3-3"/></svg>
          <span>TRENINZI</span>
        </button>
        <button class="nav-item" @click="router.push('/recepti')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h2a2 2 0 0 0 2-2V2M5 2v20M17 2c-2 3-2 8 0 11v9"/></svg>
          <span>RECEPTI AI</span>
        </button>
      </nav>
    </aside>

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Izazovi</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <template v-if="korak === 'lista'">
          <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

          <div v-else class="izazovi-lista">
            <div v-if="izazovi.length === 0" class="prazno">Trenutno nema aktivnih izazova.</div>

            <div v-for="i in izazovi" :key="i._id" class="izazov-kartica" @click="otvoriDetalje(i)">
              <div class="izazov-header">
                <div>
                  <h3 class="izazov-naziv">{{ i.naziv }}</h3>
                  <span class="izazov-meta">{{ i.vrsta === 'tim' ? 'Timski' : 'Solo' }} · {{ i.nacin === 'dnevno' ? 'Dnevno' : 'Slobodno' }} · {{ formatirajDatum(i.pocetak) }} – {{ formatirajDatum(i.kraj) }} · {{ i.brojSudionika }} {{ i.brojSudionika === 1 ? 'sudionik' : 'sudionika' }}</span>
                </div>
                <span v-if="i.pridruzen && i.status === 'eliminiran'" class="oznaka-eliminiran">Eliminiran</span>
                <span v-else-if="i.pridruzen" class="oznaka-pridruzen">✓ Pridružen</span>
                <button
                  v-else-if="i.vrsta === 'solo' && !pridruzivanjeZatvoreno(i)"
                  class="gumb-pridruzi"
                  :disabled="pridruzivanje === i._id"
                  @click.stop="pridruziSe(i)"
                >
                  {{ pridruzivanje === i._id ? 'Pridružujem...' : 'Pridruži se' }}
                </button>
                <button v-else-if="i.vrsta === 'tim' && !pridruzivanjeZatvoreno(i)" class="gumb-pridruzi" @click.stop="otvoriDetalje(i)">Odaberi tim</button>
                <span v-else class="napomena-zatvoreno" @click.stop>Pridruživanje zatvoreno</span>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="korak === 'detalji' && odabraniIzazov">
          <button class="gumb-nazad" @click="korak = 'lista'">‹ Nazad</button>

          <div class="detalji-kartica">
            <h2 class="detalji-naziv">{{ odabraniIzazov.naziv }}</h2>
            <span class="detalji-meta">
              {{ odabraniIzazov.vrsta === 'tim' ? 'Timski' : 'Solo' }} · {{ odabraniIzazov.nacin === 'dnevno' ? 'Dnevno' : 'Slobodno' }} ·
              {{ formatirajDatum(odabraniIzazov.pocetak) }} – {{ formatirajDatum(odabraniIzazov.kraj) }} ·
              {{ odabraniIzazov.brojSudionika }} {{ odabraniIzazov.brojSudionika === 1 ? 'sudionik' : 'sudionika' }}
            </span>

            <div class="detalji-tabovi">
              <button class="detalji-tab" :class="{ 'detalji-tab-aktivan': modalTab === 'pravila' }" @click="modalTab = 'pravila'">Pravila</button>
              <button class="detalji-tab" :class="{ 'detalji-tab-aktivan': modalTab === 'ljestvica' }" @click="odaberiTabLjestvica">Ljestvica</button>
            </div>

            <div v-if="modalTab === 'pravila'" class="detalji-sekcija">
              <span v-if="odabraniIzazov.pridruzen && odabraniIzazov.status === 'eliminiran'" class="oznaka-eliminiran">Eliminiran</span>
              <span v-else-if="odabraniIzazov.pridruzen" class="oznaka-pridruzen">✓ Pridružen</span>
              <button
                v-else-if="odabraniIzazov.vrsta === 'solo' && !pridruzivanjeZatvoreno(odabraniIzazov)"
                class="gumb-pridruzi"
                :disabled="pridruzivanje === odabraniIzazov._id"
                @click="pridruziSe(odabraniIzazov)"
              >
                {{ pridruzivanje === odabraniIzazov._id ? 'Pridružujem...' : 'Pridruži se' }}
              </button>
              <p v-else-if="!odabraniIzazov.pridruzen && pridruzivanjeZatvoreno(odabraniIzazov)" class="napomena-zatvoreno-veca">
                Pridruživanje je zatvoreno — dnevnom izazovu je moguće pridružiti se samo prvog dana.
              </p>

              <div v-if="odabraniIzazov.vrsta === 'tim' && !odabraniIzazov.pridruzen && !pridruzivanjeZatvoreno(odabraniIzazov)" class="timovi-sekcija">
                <div v-if="odabraniIzazov.ucitavaTimove" class="ljestvica-ucitavanje">Učitavam timove...</div>
                <template v-else>
                  <div class="uvjeti-naslov">ODABERI TIM</div>
                  <div v-if="odabraniIzazov.timovi && odabraniIzazov.timovi.length" class="timovi-lista">
                    <div v-for="t in odabraniIzazov.timovi" :key="t.timId" class="tim-red" :class="{ 'tim-pun': t.puna }">
                      <div class="tim-info">
                        <span class="tim-naziv">{{ t.naziv }}</span>
                        <span class="tim-clanovi">{{ t.brojClanova }}{{ odabraniIzazov.velicinaTima ? '/' + odabraniIzazov.velicinaTima : '' }} · {{ t.clanovi.map(c => c.ime).join(', ') }}</span>
                      </div>
                      <button
                        class="gumb-pridruzi gumb-pridruzi-malo"
                        :disabled="t.puna || pridruzivanjeTimu === t.timId"
                        @click="pridruziSeTimu(t)"
                      >
                        {{ t.puna ? 'Puno' : (pridruzivanjeTimu === t.timId ? 'Pridružujem...' : 'Pridruži se') }}
                      </button>
                    </div>
                  </div>
                  <div v-else class="prazno-malo">Još nema formiranih timova. Budi prvi!</div>

                  <div class="novi-tim-red">
                    <input v-model="noviNazivTima" class="forma-input" placeholder="Naziv novog tima" />
                    <button
                      class="gumb-pridruzi gumb-pridruzi-malo"
                      :disabled="!noviNazivTima.trim() || stvaranjeTima"
                      @click="stvoriNoviTim"
                    >
                      {{ stvaranjeTima ? 'Stvaram...' : '+ Novi tim' }}
                    </button>
                  </div>
                  <div v-if="timGreska" class="poruka-greska">{{ timGreska }}</div>
                </template>
              </div>

              <div v-if="odabraniIzazov.vrsta === 'tim' && odabraniIzazov.pridruzen" class="timovi-sekcija">
                <div v-if="odabraniIzazov.ucitavaTimove" class="ljestvica-ucitavanje">Učitavam tim...</div>
                <template v-else-if="mojTimZaIzazov(odabraniIzazov)">
                  <div class="uvjeti-naslov">TVOJ TIM — {{ mojTimZaIzazov(odabraniIzazov).naziv }}</div>
                  <div class="timovi-lista">
                    <div v-for="c in mojTimZaIzazov(odabraniIzazov).clanovi" :key="c.korisnikId" class="tim-clan-red">
                      <img v-if="c.slika" :src="c.slika" class="ljestvica-avatar" />
                      <div v-else class="ljestvica-avatar-inicijali">{{ inicijaliIme(c.ime) }}</div>
                      <span class="tim-clan-ime">{{ c.ime }}</span>
                      <button
                        v-if="mojTimZaIzazov(odabraniIzazov).kapetan === auth.korisnik?.id && c.korisnikId !== auth.korisnik?.id"
                        class="gumb-izbaci"
                        :disabled="izbacivanjeClana === c.korisnikId"
                        @click="izbaciClana(mojTimZaIzazov(odabraniIzazov), c)"
                        title="Izbaci iz tima"
                      >✕</button>
                    </div>
                  </div>
                  <div v-if="timGreska" class="poruka-greska">{{ timGreska }}</div>
                </template>
              </div>

              <p v-if="odabraniIzazov.opis" class="izazov-opis">{{ odabraniIzazov.opis }}</p>

              <div v-if="odabraniIzazov.nacin === 'dnevno'" class="napomena-dnevno">
                Mora se ispuniti barem jedno pravilo svaki dan — preskočen dan znači ispadanje iz izazova.
              </div>

              <div class="uvjeti-lista">
                <div class="uvjeti-naslov">PRAVILA BODOVANJA</div>
                <div v-for="(u, idx) in odabraniIzazov.uvjeti" :key="idx" class="uvjet-red">
                  <span class="uvjet-ikona">{{ tipIkona(u.tip) }}</span>
                  <span>{{ tipNaziv(u.tip) }}: svakih <b>{{ u.cilj }} {{ jedinicaTeksta(u.mjera) }}</b> = <b>{{ u.bodovi }} bodova</b> (ponavlja se)</span>
                </div>
              </div>
            </div>

            <div v-else class="detalji-sekcija ljestvica">
              <div v-if="odabraniIzazov.ucitavaLjestvicu" class="ljestvica-ucitavanje">Učitavam ljestvicu...</div>
              <template v-else>
                <div class="ljestvica-alat-traka">
                  <span class="ljestvica-azurirano">
                    {{ odabraniIzazov.azurirana ? `Ažurirano: ${formatirajVrijemeAzuriranja(odabraniIzazov.azurirana)}` : 'Bodovi još nisu izračunati' }}
                  </span>
                  <button class="gumb-osvjezi" :disabled="odabraniIzazov.osvjezavaLjestvicu" @click="osvjeziLjestvicu">
                    {{ odabraniIzazov.osvjezavaLjestvicu ? 'Osvježavam...' : '↻ Osvježi' }}
                  </button>
                </div>

                <input
                  v-if="odabraniIzazov.vrsta !== 'tim' && odabraniIzazov.ljestvica && odabraniIzazov.ljestvica.length > 0"
                  v-model="pretragaLjestvice"
                  class="pretraga-input"
                  placeholder="Pretraži po imenu..."
                />

                <template v-if="odabraniIzazov.vrsta !== 'tim'">
                  <div v-if="!odabraniIzazov.ljestvica || odabraniIzazov.ljestvica.length === 0" class="prazno-malo">Još nema sudionika.</div>
                  <div v-else-if="filtriranaLjestvica.length === 0" class="prazno-malo">Nema rezultata za "{{ pretragaLjestvice }}".</div>
                  <div
                    v-for="r in filtriranaLjestvica"
                    :key="r.korisnikId"
                    class="ljestvica-red"
                    :class="{ 'ljestvica-eliminiran': r.status === 'eliminiran' }"
                    @click="otvoriSudionika(r)"
                  >
                    <span class="ljestvica-mjesto">#{{ r.mjesto }}</span>
                    <img v-if="r.slika" :src="r.slika" class="ljestvica-avatar" />
                    <div v-else class="ljestvica-avatar-inicijali">{{ inicijaliIme(r.ime) }}</div>
                    <div class="ljestvica-info">
                      <span class="ljestvica-ime">{{ r.ime }}</span>
                      <span v-if="r.status === 'eliminiran'" class="ljestvica-status">Ispao {{ formatirajDatum(r.eliminiranDatum) }}</span>
                    </div>
                    <span class="ljestvica-bodovi">{{ r.bodovi }} bod.</span>
                  </div>
                </template>
                <template v-else>
                  <div v-if="!odabraniIzazov.timLjestvica || odabraniIzazov.timLjestvica.length === 0" class="prazno-malo">Još nema timova.</div>
                  <div v-for="(t, idx) in odabraniIzazov.timLjestvica" :key="t.timId" class="tim-ljestvica-blok">
                    <div
                      class="tim-ljestvica-header tim-ljestvica-header-klik"
                      @click="prosireniTim = prosireniTim === t.timId ? null : t.timId"
                    >
                      <span class="tim-ljestvica-strelica">{{ prosireniTim === t.timId ? '▾' : '▸' }}</span>
                      <span class="ljestvica-mjesto">#{{ idx + 1 }}</span>
                      <span class="tim-ljestvica-naziv">{{ t.naziv }}</span>
                      <span class="ljestvica-bodovi">{{ t.bodovi }} bod.</span>
                    </div>
                    <template v-if="prosireniTim === t.timId">
                      <div
                        v-for="c in t.clanovi"
                        :key="c.korisnikId"
                        class="ljestvica-red ljestvica-red-clan"
                        :class="{ 'ljestvica-eliminiran': c.status === 'eliminiran' }"
                        @click="otvoriSudionika(c)"
                      >
                        <img v-if="c.slika" :src="c.slika" class="ljestvica-avatar" />
                        <div v-else class="ljestvica-avatar-inicijali">{{ inicijaliIme(c.ime) }}</div>
                        <div class="ljestvica-info">
                          <span class="ljestvica-ime">{{ c.ime }}</span>
                          <span v-if="c.status === 'eliminiran'" class="ljestvica-status">Ispao {{ formatirajDatum(c.eliminiranDatum) }}</span>
                        </div>
                        <span class="ljestvica-bodovi">{{ c.bodovi }} bod.</span>
                      </div>
                    </template>
                  </div>
                </template>
              </template>
            </div>
          </div>
        </template>

        <template v-else-if="korak === 'sudionik'">
          <button class="gumb-nazad" @click="korak = 'detalji'">‹ Nazad na ljestvicu</button>

          <div v-if="ucitavaSudionika" class="ucitavanje"><div class="spinner"></div></div>

          <div v-else-if="odabraniSudionik" class="detalji-kartica">
            <div class="sudionik-header">
              <img v-if="odabraniSudionik.slika" :src="odabraniSudionik.slika" class="ljestvica-avatar sudionik-avatar-veci" />
              <div v-else class="ljestvica-avatar-inicijali sudionik-avatar-veci">{{ inicijaliIme(odabraniSudionik.ime) }}</div>
              <div>
                <h3 class="izazov-naziv">{{ odabraniSudionik.ime }}</h3>
                <span class="izazov-meta">
                  {{ odabraniSudionik.bodovi }} bodova ·
                  {{ odabraniSudionik.status === 'eliminiran' ? `Ispao ${formatirajDatum(odabraniSudionik.eliminiranDatum)}` : 'Aktivan' }}
                </span>
              </div>
            </div>

            <div v-if="odabraniSudionik.uvjeti" class="sudionik-sekcija">
              <div v-for="(u, idx) in odabraniSudionik.uvjeti" :key="idx" class="uvjet-detalj-blok">
                <div class="uvjet-detalj-naslov">
                  {{ tipIkona(u.tip) }} {{ tipNaziv(u.tip) }} — {{ zaokruzi(u.napredak) }} / {{ u.cilj }} {{ jedinicaTeksta(u.mjera) }} → <b>{{ u.bodoviOstvareno }} bodova</b>
                </div>
                <div v-if="u.aktivnosti.length === 0" class="prazno-malo">Nema aktivnosti koje se broje.</div>
                <div v-for="a in u.aktivnosti" :key="a.stravaId" class="sudionik-aktivnost-red" :class="{ 'sudionik-aktivnost-bez-bodova': !a.bodoviOstvareno }">
                  <span>{{ tipIkona(a.tip) }} {{ a.naziv }}</span>
                  <span class="sudionik-aktivnost-vrijednost">
                    {{ formatirajDatum(a.datum) }} · {{ vrijednostAktivnosti(a, u.mjera) }}
                    <template v-if="a.bodoviOstvareno != null"> · {{ a.bodoviOstvareno }} bod.</template>
                  </span>
                </div>
              </div>
            </div>

            <div v-else-if="odabraniSudionik.dani" class="sudionik-sekcija">
              <div v-for="(d, idx) in odabraniSudionik.dani" :key="idx" class="dan-blok" :class="{ 'dan-nije-prosao': !d.prosao }">
                <div class="dan-naslov">
                  {{ d.prosao ? '✓' : '✕' }} {{ formatirajDatum(d.datum) }} — {{ d.prosao ? `${d.bodovi} bodova` : 'nije ispunjen nijedan uvjet' }}
                </div>
                <div v-if="d.aktivnosti.length === 0" class="prazno-malo">Nema aktivnosti taj dan.</div>
                <template v-else>
                  <div v-for="(u, uidx) in d.uvjeti" :key="uidx" class="uvjet-detalj-blok uvjet-detalj-blok-dan">
                    <div class="uvjet-detalj-naslov">
                      {{ tipIkona(u.tip) }} {{ tipNaziv(u.tip) }} — {{ zaokruzi(u.napredak) }} / {{ u.cilj }} {{ jedinicaTeksta(u.mjera) }} → <b>{{ u.bodoviOstvareno }} bodova</b>
                    </div>
                    <div v-if="u.aktivnosti.length === 0" class="prazno-malo">Nema aktivnosti koje se broje.</div>
                    <div v-for="a in u.aktivnosti" :key="a.stravaId" class="sudionik-aktivnost-red" :class="{ 'sudionik-aktivnost-bez-bodova': !a.bodoviOstvareno }">
                      <span>{{ tipIkona(a.tip) }} {{ a.naziv }}</span>
                      <span class="sudionik-aktivnost-vrijednost">
                        {{ vrijednostAktivnosti(a, u.mjera) }}
                        <template v-if="a.bodoviOstvareno != null"> · {{ a.bodoviOstvareno }} bod.</template>
                      </span>
                    </div>
                  </div>
                </template>
              </div>
            </div>
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
import { formatirajDatum } from '../utils/aktivnosti.js';
import { potvrdi } from '../composables/potvrda.js';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';

const router = useRouter();
const auth = useAuthStore();

const NAZIVI_TIPOVA = { Run: 'Trčanje', Ride: 'Biciklizam', Walk: 'Hodanje', Swim: 'Plivanje', Workout: 'Trening snage' };
const IKONE_TIPOVA = { Run: '🏃', Ride: '🚴', Walk: '🚶', Swim: '🏊', Workout: '💪' };
const JEDINICE = { km: 'km', vrijeme: 'minuta', kalorije: 'kalorija', elevacija: 'm visinske razlike', broj: 'aktivnosti' };

function tipNaziv(tip) { return NAZIVI_TIPOVA[tip] || tip; }
function tipIkona(tip) { return IKONE_TIPOVA[tip] || '⚡'; }
function jedinicaTeksta(mjera) { return JEDINICE[mjera] || ''; }
function inicijaliIme(ime) { return (ime || '').split(' ').map(r => r[0]).join('').toUpperCase().slice(0, 2); }

function pridruzivanjeZatvoreno(izazov) {
  if (izazov.nacin !== 'dnevno') return false;
  const krajPrvogDana = new Date(izazov.pocetak);
  krajPrvogDana.setHours(23, 59, 59, 999);
  return krajPrvogDana < new Date();
}
function zaokruzi(broj) { return Math.round((broj || 0) * 10) / 10; }

function vrijednostAktivnosti(a, mjera) {
  if (mjera === 'km') return `${(a.udaljenost / 1000).toFixed(2)} km`;
  if (mjera === 'vrijeme') return `${Math.round(a.trajanje / 60)} min`;
  if (mjera === 'kalorije') return `${a.kalorije ?? 0} kcal`;
  if (mjera === 'elevacija') return `${a.visinskaRazlika ?? 0} m`;
  return '1 aktivnost';
}

const mobilniMeni = ref(false);
const brojUTeretani = ref(null);
const ucitavanje = ref(false);
const izazovi = ref([]);
const pridruzivanje = ref(null);
const odabraniIzazov = ref(null);
const modalTab = ref('pravila');
const korak = ref('lista');
const pretragaLjestvice = ref('');
const odabraniSudionik = ref(null);
const ucitavaSudionika = ref(false);
const noviNazivTima = ref('');
const stvaranjeTima = ref(false);
const pridruzivanjeTimu = ref(null);
const timGreska = ref('');
const izbacivanjeClana = ref(null);
const prosireniTim = ref(null);

const filtriranaLjestvica = computed(() => {
  const lista = (odabraniIzazov.value?.ljestvica || []).map((r, idx) => ({ ...r, mjesto: idx + 1 }));
  const q = pretragaLjestvice.value.trim().toLowerCase();
  if (!q) return lista;
  return lista.filter(r => r.ime.toLowerCase().includes(q));
});

async function ucitajIzazove() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/izazovi');
    izazovi.value = (data.aktivni || []).map(i => ({
      ...i,
      ucitavaLjestvicu: false,
      osvjezavaLjestvicu: false,
      ljestvica: null,
      timLjestvica: null,
      azurirana: null,
      timovi: null,
      ucitavaTimove: false,
    }));
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

async function pridruziSe(izazov) {
  pridruzivanje.value = izazov._id;
  try {
    await api.post(`/izazovi/${izazov._id}/pridruzi`);
    izazov.pridruzen = true;
    izazov.brojSudionika += 1;
  } catch (err) {
    console.error(err);
  } finally {
    pridruzivanje.value = null;
  }
}

function otvoriDetalje(izazov) {
  odabraniIzazov.value = izazov;
  modalTab.value = 'pravila';
  pretragaLjestvice.value = '';
  timGreska.value = '';
  noviNazivTima.value = '';
  prosireniTim.value = null;
  korak.value = 'detalji';
  if (izazov.vrsta === 'tim' && !izazov.timovi) {
    ucitajTimove(izazov);
  }
}

function mojTimZaIzazov(izazov) {
  if (!izazov.timovi) return null;
  return izazov.timovi.find(t => t.clanovi.some(c => c.korisnikId === auth.korisnik?.id)) || null;
}

async function ucitajTimove(izazov) {
  izazov.ucitavaTimove = true;
  try {
    const { data } = await api.get(`/izazovi/${izazov._id}/timovi`);
    izazov.timovi = data.timovi || [];
    izazov.velicinaTima = data.velicinaTima;
  } catch (err) {
    console.error(err);
  } finally {
    izazov.ucitavaTimove = false;
  }
}

async function stvoriNoviTim() {
  const izazov = odabraniIzazov.value;
  if (!noviNazivTima.value.trim()) return;
  timGreska.value = '';
  stvaranjeTima.value = true;
  try {
    await api.post(`/izazovi/${izazov._id}/timovi`, { naziv: noviNazivTima.value.trim() });
    izazov.pridruzen = true;
    izazov.status = 'aktivan';
    izazov.brojSudionika += 1;
    noviNazivTima.value = '';
    await ucitajTimove(izazov);
  } catch (err) {
    timGreska.value = err.response?.data?.poruka || 'Greška pri stvaranju tima.';
  } finally {
    stvaranjeTima.value = false;
  }
}

async function pridruziSeTimu(tim) {
  const izazov = odabraniIzazov.value;
  timGreska.value = '';
  pridruzivanjeTimu.value = tim.timId;
  try {
    await api.post(`/izazovi/${izazov._id}/timovi/${tim.timId}/pridruzi`);
    izazov.pridruzen = true;
    izazov.status = 'aktivan';
    izazov.brojSudionika += 1;
    await ucitajTimove(izazov);
  } catch (err) {
    timGreska.value = err.response?.data?.poruka || 'Greška pri pridruživanju timu.';
  } finally {
    pridruzivanjeTimu.value = null;
  }
}

async function izbaciClana(tim, clan) {
  if (!(await potvrdi(`Izbaciti ${clan.ime} iz tima "${tim.naziv}"?`))) return;
  const izazov = odabraniIzazov.value;
  timGreska.value = '';
  izbacivanjeClana.value = clan.korisnikId;
  try {
    await api.delete(`/izazovi/${izazov._id}/timovi/${tim.timId}/clanovi/${clan.korisnikId}`);
    await ucitajTimove(izazov);
  } catch (err) {
    timGreska.value = err.response?.data?.poruka || 'Greška pri izbacivanju člana.';
  } finally {
    izbacivanjeClana.value = null;
  }
}

async function otvoriSudionika(sudionik) {
  odabraniSudionik.value = null;
  ucitavaSudionika.value = true;
  korak.value = 'sudionik';
  try {
    const { data } = await api.get(`/izazovi/${odabraniIzazov.value._id}/sudionik/${sudionik.korisnikId}`);
    odabraniSudionik.value = data;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavaSudionika.value = false;
  }
}

async function odaberiTabLjestvica() {
  modalTab.value = 'ljestvica';
  const izazov = odabraniIzazov.value;
  if (!izazov) return;
  const vecUcitano = izazov.vrsta === 'tim' ? izazov.timLjestvica : izazov.ljestvica;
  if (vecUcitano) return;

  izazov.ucitavaLjestvicu = true;
  try {
    const { data } = await api.get(`/izazovi/${izazov._id}/ljestvica`);
    if (izazov.vrsta === 'tim') {
      izazov.timLjestvica = data.timovi || [];
    } else {
      izazov.ljestvica = data.ljestvica || [];
    }
    izazov.azurirana = data.azurirana;
  } catch (err) {
    console.error(err);
  } finally {
    izazov.ucitavaLjestvicu = false;
  }
}

async function osvjeziLjestvicu() {
  const izazov = odabraniIzazov.value;
  if (!izazov) return;

  izazov.osvjezavaLjestvicu = true;
  try {
    await api.post(`/izazovi/${izazov._id}/ljestvica/osvjezi`);
    const { data } = await api.get(`/izazovi/${izazov._id}/ljestvica`);
    if (izazov.vrsta === 'tim') {
      izazov.timLjestvica = data.timovi || [];
    } else {
      izazov.ljestvica = data.ljestvica || [];
    }
    izazov.azurirana = data.azurirana;
  } catch (err) {
    console.error(err);
  } finally {
    izazov.osvjezavaLjestvicu = false;
  }
}

function formatirajVrijemeAzuriranja(datum) {
  return new Date(datum).toLocaleString('hr-HR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function ucitajBrojUTeretani() {
  try {
    const { data } = await api.get('/clanarina/broj-u-teretani');
    brojUTeretani.value = data.broj;
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  ucitajIzazove();
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

.korisnik-avatar {
  width: 42px; height: 42px; border-radius: 50%;
  object-fit: cover; border: 2px solid rgba(0,0,0,0.2); flex-shrink: 0;
}

.korisnik-inicijali {
  width: 42px; height: 42px; border-radius: 50%;
  background: #1a1a1a; color: #f5c800;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1rem; flex-shrink: 0;
}

.korisnik-info { display: flex; flex-direction: column; gap: 0.2rem; overflow: hidden; }
.korisnik-ime {
  color: #1a1a1a; font-size: 0.9rem; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
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

.prazno { padding: 3rem 2rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.95rem; }

.izazovi-lista { display: flex; flex-direction: column; gap: 1.25rem; }

.izazov-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: border-color 0.2s;
}
.izazov-kartica:hover { border-color: rgba(245,200,0,0.3); }

.izazov-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }

.izazov-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.25rem; font-weight: 800; letter-spacing: 0.03em; margin: 0 0 0.3rem;
}

.izazov-meta { font-size: 0.8rem; color: rgba(255,255,255,0.4); }

.oznaka-pridruzen {
  background: rgba(74,222,128,0.15);
  color: #4ade80;
  border: 1px solid rgba(74,222,128,0.35);
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.oznaka-eliminiran {
  background: rgba(255,255,255,0.06);
  color: #f87171;
  border: 1px solid rgba(248,113,113,0.35);
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.izazov-opis { font-size: 0.9rem; color: rgba(255,255,255,0.6); margin: 0.85rem 0 0; line-height: 1.5; }

.napomena-dnevno {
  margin-top: 0.85rem;
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.3);
  color: #fbbf24;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.82rem;
}

.uvjeti-lista { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }

.uvjeti-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.08em;
  margin-bottom: 0.15rem;
}

.uvjet-red {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.75);
  background: #1e1e1e;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
}

.uvjet-ikona { font-size: 1.1rem; }

.gumb-pridruzi {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.65rem 1.4rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-pridruzi:hover:not(:disabled) { background: #ffd700; }
.gumb-pridruzi:disabled { cursor: not-allowed; opacity: 0.7; }

.napomena-zatvoreno { font-size: 0.8rem; color: rgba(255,255,255,0.35); font-style: italic; flex-shrink: 0; white-space: nowrap; }
.napomena-zatvoreno-veca { font-size: 0.9rem; color: rgba(255,255,255,0.4); font-style: italic; margin: 0 0 1rem; }

.timovi-sekcija { margin: 0 0 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }

.timovi-lista { display: flex; flex-direction: column; gap: 0.5rem; }

.tim-red {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: #1e1e1e;
  border-radius: 8px;
  padding: 0.65rem 0.9rem;
}
.tim-pun { opacity: 0.55; }

.tim-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.tim-naziv { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 0.95rem; }
.tim-clanovi { font-size: 0.75rem; color: rgba(255,255,255,0.4); }

.novi-tim-red { display: flex; gap: 0.6rem; }
.novi-tim-red .forma-input { flex: 1; }

.tim-clan-red {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.6rem;
  background: #1e1e1e;
  border-radius: 8px;
}
.tim-clan-ime { flex: 1; font-size: 0.88rem; }

.gumb-izbaci {
  background: none;
  border: 1px solid rgba(248,113,113,0.35);
  color: #f87171;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.2s;
}
.gumb-izbaci:hover:not(:disabled) { background: rgba(248,113,113,0.12); }
.gumb-izbaci:disabled { opacity: 0.5; cursor: not-allowed; }

.gumb-pridruzi-malo { padding: 0.5rem 1rem; font-size: 0.85rem; flex-shrink: 0; }

.forma-input {
  width: 100%;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.6rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.88rem;
}
.forma-input:focus { outline: none; border-color: #f5c800; }

.poruka-greska { color: #f87171; font-size: 0.82rem; }

.ljestvica {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ljestvica-ucitavanje, .prazno-malo {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.35);
  text-align: center;
  padding: 0.5rem;
}

.ljestvica-alat-traka {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}

.ljestvica-azurirano { font-size: 0.78rem; color: rgba(255,255,255,0.35); }

.gumb-osvjezi {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.7);
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  font-size: 0.82rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  flex-shrink: 0;
}
.gumb-osvjezi:hover:not(:disabled) { border-color: #f5c800; color: #f5c800; }
.gumb-osvjezi:disabled { opacity: 0.5; cursor: not-allowed; }

.pretraga-input {
  width: 100%;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.6rem 0.85rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.88rem;
  margin-bottom: 0.75rem;
}
.pretraga-input:focus { outline: none; border-color: #f5c800; }

.ljestvica-red {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.6rem;
  background: #1e1e1e;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.ljestvica-red:hover { background: #262626; }
.ljestvica-eliminiran { opacity: 0.5; }

.ljestvica-mjesto {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  color: #f5c800;
  min-width: 28px;
}

.ljestvica-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.ljestvica-avatar-inicijali {
  width: 28px; height: 28px; border-radius: 50%;
  background: #f5c800; color: #1a1a1a;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.7rem; font-weight: 800; flex-shrink: 0;
  font-family: 'Barlow Condensed', sans-serif;
}

.ljestvica-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.ljestvica-ime { font-size: 0.88rem; }
.ljestvica-status { font-size: 0.72rem; color: #f87171; }
.ljestvica-bodovi { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; color: #f5c800; font-size: 0.95rem; }

.tim-ljestvica-blok { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.5rem; }
.tim-ljestvica-header { display: flex; align-items: center; gap: 0.65rem; padding: 0.3rem 0.6rem; }
.tim-ljestvica-header-klik { cursor: pointer; border-radius: 8px; transition: background 0.2s; }
.tim-ljestvica-header-klik:hover { background: #1e1e1e; }
.tim-ljestvica-strelica { color: rgba(255,255,255,0.4); font-size: 0.7rem; width: 12px; flex-shrink: 0; }
.tim-ljestvica-naziv { flex: 1; font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1rem; }
.ljestvica-red-clan { margin-left: 1.6rem; background: #1a1a1a; }

.sudionik-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sudionik-avatar-veci { width: 52px; height: 52px; font-size: 1.1rem; }

.sudionik-sekcija { display: flex; flex-direction: column; gap: 1rem; }

.uvjet-detalj-blok, .dan-blok {
  background: #1e1e1e;
  border-radius: 10px;
  padding: 0.9rem 1rem;
}

.dan-blok.dan-nije-prosao { border: 1px solid rgba(239,68,68,0.3); }

.uvjet-detalj-naslov, .dan-naslov {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.85);
  margin-bottom: 0.6rem;
}

.sudionik-aktivnost-red {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.65);
  border-top: 1px solid rgba(255,255,255,0.05);
}
.sudionik-aktivnost-red:first-of-type { border-top: none; }

.sudionik-aktivnost-vrijednost { color: #f5c800; flex-shrink: 0; white-space: nowrap; }
.sudionik-aktivnost-bez-bodova { opacity: 0.4; }
.sudionik-aktivnost-bez-bodova .sudionik-aktivnost-vrijednost { color: rgba(255,255,255,0.4); }

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

.detalji-kartica {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.75rem;
}

.detalji-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.3rem;
}

.detalji-meta {
  display: block;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.4);
  margin-bottom: 1.25rem;
}

.detalji-tabovi {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.detalji-tab {
  background: none;
  border: none;
  color: rgba(255,255,255,0.45);
  padding: 0.65rem 0.25rem;
  margin-right: 1.25rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}
.detalji-tab:hover { color: #fff; }
.detalji-tab-aktivan { color: #f5c800; border-bottom-color: #f5c800; }

.detalji-sekcija .gumb-pridruzi,
.detalji-sekcija .oznaka-pridruzen { margin-bottom: 1.25rem; }

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
  .izazov-header { flex-direction: column; }
}
</style>
