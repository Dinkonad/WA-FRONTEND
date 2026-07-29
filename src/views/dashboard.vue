<template>
  <div class="dashboard">

    <BocnaNavigacija aktivna="statistike" :otvoren="mobilniMeni" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Statistike</h1>
        <ZaglavljeMeni />
      </header>

      <div class="period-filter">
        <button v-for="p in periodi" :key="p.kljuc" class="period-gumb" :class="{ 'period-aktivan': aktivniPeriod === p.kljuc }" @click="aktivniPeriod = p.kljuc">
          {{ p.naziv }}
        </button>
      </div>

      <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

      <div v-else>

        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-broj">{{ periodFiltrirane.length }}</div>
            <div class="stat-label">Aktivnosti</div>
          </div>
          <div class="stat-box">
            <div class="stat-broj">{{ ukupnoVrijeme }}</div>
            <div class="stat-label">Sati treninga</div>
          </div>
          <div class="stat-box">
            <div class="stat-broj">{{ ukupnoKm }}</div>
            <div class="stat-label">Kilometara</div>
          </div>
          <div class="stat-box">
            <div class="stat-broj">{{ ukupnoKalorije }}</div>
            <div class="stat-label">Kalorija</div>
          </div>
        </div>

        <template v-if="aktivniPeriod === 'ukupno' || aktivniPeriod === 'godisnje'">
          <div class="sazetak-kartica">
            <div class="donut-wrap">
              <svg viewBox="0 0 120 120" class="donut-svg donut-svg-veci">
                <circle cx="60" cy="60" r="45" fill="none" stroke="#2a2a2a" stroke-width="16"/>
                <circle v-for="(segment, i) in donutSegmenti" :key="i" cx="60" cy="60" r="45" fill="none" :stroke="segment.boja" stroke-width="16" :stroke-dasharray="`${segment.duljina} ${283 - segment.duljina}`" :stroke-dashoffset="segment.offset"/>
              </svg>
              <div class="donut-legenda">
                <div v-for="(s, i) in donutSegmenti" :key="i" class="legenda-stavka">
                  <span class="legenda-dot" :style="{ background: s.boja }"></span>
                  <span class="legenda-tekst">{{ s.tip }} {{ s.postotak }}%</span>
                </div>
              </div>
            </div>

            <table class="sazetak-tablica">
              <thead>
                <tr><th>Sport</th><th>Treninzi</th><th>Km</th><th>Vrijeme</th></tr>
              </thead>
              <tbody>
                <tr v-for="s in sazetakPoTipu" :key="s.tip">
                  <td class="sazetak-sport">{{ tipIkona(s.tip) }} {{ s.naziv }}</td>
                  <td>{{ s.broj }}</td>
                  <td>{{ s.km }}</td>
                  <td>{{ s.vrijeme }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <template v-if="aktivniPeriod === 'godisnje'">
          <div class="navigacija-period">
            <button class="nav-strelica" @click="godinaOffset--">‹</button>
            <span class="nav-naziv">{{ trenutnaGodina }}</span>
            <button class="nav-strelica" @click="godinaOffset++" :disabled="godinaOffset >= 0">›</button>
          </div>

          <div class="bar-chart-kartica">
            <div class="bar-chart-naslov">MJESEČNE AKTIVNOSTI</div>
            <div class="bar-chart">
              <div v-for="mj in mjesecneAktivnosti" :key="mj.kljuc" class="bar-col">
                <div class="bar-trajanje">{{ mj.km > 0 ? mj.km.toFixed(0) + ' km' : '' }}</div>
                <div class="bar-wrap">
                  <div class="bar" :style="{ height: mj.visina + '%' }" :class="{ 'bar-aktivan': mj.km > 0 }"></div>
                </div>
                <div class="bar-dan">{{ mj.naziv }}</div>
              </div>
            </div>
          </div>

          <div class="tipovi-grid">
            <div v-for="tip in tipoviGodisnje" :key="tip.tip" class="tip-box">
              <div class="tip-ikona">{{ tipIkona(tip.tip) }}</div>
              <div class="tip-naziv">{{ tipNazivi[tip.tip] || tip.tip }}</div>
              <div class="tip-broj">{{ tip.broj }}</div>
              <div class="tip-trend">↑ {{ tip.postotak }}%</div>
            </div>
          </div>

          <div class="dodatne-kartica">
            <div class="dodatne-naslov">DODATNE AKTIVNOSTI</div>
            <div class="dodatne-grid">
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.streak }}</div>
                <div class="dodatna-label">Najduži niz</div>
                <div class="dodatna-sub">dana treninga</div>
              </div>
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.prosjecnoTjedno }}</div>
                <div class="dodatna-label">Prosječno tjedno</div>
                <div class="dodatna-sub">treninga</div>
              </div>
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.najaktivnijiDan }}</div>
                <div class="dodatna-label">Najaktivniji dan</div>
                <div class="dodatna-sub">{{ godisnjeStats.najaktivnijiDanBroj }} treninga</div>
              </div>
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.najaktivnijiMjesec }}</div>
                <div class="dodatna-label">Najaktivniji mjesec</div>
                <div class="dodatna-sub">{{ godisnjeStats.najaktivnijiMjesecBroj }} treninga</div>
              </div>
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.najduziTrening }}</div>
                <div class="dodatna-label">Najduži trening</div>
                <div class="dodatna-sub">sati</div>
              </div>
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.prosjecnoTrajanje }}</div>
                <div class="dodatna-label">Prosjek trajanja</div>
                <div class="dodatna-sub">min po treningu</div>
              </div>
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.prosjecnoKm }}</div>
                <div class="dodatna-label">Km po treningu</div>
                <div class="dodatna-sub">prosjek</div>
              </div>
              <div class="dodatna-box">
                <div class="dodatna-broj">{{ godisnjeStats.najcesciTip }}</div>
                <div class="dodatna-label">Omiljeni sport</div>
                <div class="dodatna-sub">najviše treninga</div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="aktivniPeriod === 'tjedno'">
          <div class="navigacija-period">
            <button class="nav-strelica" @click="tjedanOffset--">‹</button>
            <span class="nav-naziv">{{ nazivTjedna }}</span>
            <button class="nav-strelica" @click="tjedanOffset++" :disabled="tjedanOffset >= 0">›</button>
          </div>
          <div class="bar-chart-kartica">
            <div class="bar-chart-naslov">DNEVNE AKTIVNOSTI</div>
            <div class="bar-chart">
              <div v-for="dan in dnevneAktivnosti" :key="dan.kljuc" class="bar-col">
                <div class="bar-trajanje">{{ dan.trajanje > 0 ? dan.trajanje + ' min' : '' }}</div>
                <div class="bar-wrap">
                  <div class="bar" :style="{ height: dan.visina + '%' }" :class="{ 'bar-aktivan': dan.trajanje > 0 }"></div>
                </div>
                <div class="bar-dan">{{ dan.dan }}</div>
                <div class="bar-datum">{{ dan.datum }}</div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="aktivniPeriod === 'mjesecno'">
          <div class="navigacija-period">
            <button class="nav-strelica" @click="mjesecOffset--">‹</button>
            <span class="nav-naziv">{{ nazivMjeseca }}</span>
            <button class="nav-strelica" @click="mjesecOffset++" :disabled="mjesecOffset >= 0">›</button>
          </div>
          <div class="kalendar-kartica">
            <div class="kalendar-dani-zaglavlje">
              <span v-for="d in ['PON','UTO','SRI','ČET','PET','SUB','NED']" :key="d">{{ d }}</span>
            </div>
            <div class="kalendar-grid">
              <div
                v-for="(dan, i) in kalendarDani"
                :key="i"
                class="kalendar-dan"
                :class="{ 'kalendar-prazan': !dan.broj, 'kalendar-ima-aktivnost': dan.aktivnosti.length > 0, 'kalendar-danas': dan.danas }"
              >
                <span class="kalendar-broj">{{ dan.broj }}</span>
                <span v-if="dan.aktivnosti.length > 0" class="kalendar-ikona">{{ tipIkona(dan.aktivnosti[0].tip) }}</span>
              </div>
            </div>
          </div>
        </template>

    
        <div v-if="!stravaSpojeno" class="strava-banner">
          <span>Spoji Stravu za aktivnosti</span>
          <button class="gumb-spoji" @click="spojiStravu">Spoji</button>
        </div>

        <div class="aktivnosti-sekcija">
          <div class="aktivnosti-header">
            <span>Aktivnosti</span>
            <button class="sync-gumb" @click="sinkroniziraj" :disabled="syncing">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :class="{ 'rotiraj': syncing }">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              {{ syncing ? 'Sync...' : 'Sync' }}
            </button>
          </div>

          <div v-if="filtrirane.length === 0" class="prazno">Nema aktivnosti za odabrani period.</div>

          <div v-for="akt in filtrirane" :key="akt.stravaId" class="aktivnost-red" @click="otvoriAktivnost(akt)">
            <div class="akt-tip">
              <span class="akt-ikona">{{ tipIkona(akt.tip) }}</span>
              <span class="akt-naziv">{{ akt.naziv.toUpperCase() }}</span>
            </div>
            <span class="akt-km">{{ (akt.udaljenost / 1000).toFixed(1) }} Km</span>
            <span class="akt-datum">{{ formatirajDatum(akt.datum) }}</span>
            <label class="feed-toggle" @click.stop title="Prikaži u Fitnes Feedu">
              <input type="checkbox" :checked="akt.uFeedu" @change="promijeniFeedStatus(akt)" />
              <span class="feed-toggle-klizac"></span>
            </label>
          </div>

          <button v-if="periodFiltrirane.length > prikazano" class="gumb-vise" @click="prikazano += 10">
            PREGLEDAJ SVE AKTIVNOSTI
          </button>
        </div>

      </div>
    </main>

    <div v-if="odabranaAktivnost" class="modal-overlay" @click.self="odabranaAktivnost = null">
      <div class="modal">
        <button class="modal-zatvori" @click="odabranaAktivnost = null">✕</button>
        <div class="modal-zaglavlje">
          <span class="modal-ikona-velika">{{ tipIkona(odabranaAktivnost.tip) }}</span>
          <div>
            <h2 class="modal-naziv">{{ odabranaAktivnost.naziv }}</h2>
            <span class="modal-tip-datum">{{ odabranaAktivnost.tip }} · {{ formatirajDatumPuni(odabranaAktivnost.datum) }}</span>
          </div>
        </div>

        <div class="modal-feed-sekcija">
          <label class="feed-toggle" @click.stop>
            <input type="checkbox" :checked="odabranaAktivnost.uFeedu" @change="promijeniFeedStatus(odabranaAktivnost)" />
            <span class="feed-toggle-klizac"></span>
          </label>
          <span class="modal-feed-label">Prikaži u Fitnes Feedu</span>
        </div>
        <div v-if="odabranaAktivnost.uFeedu" class="modal-opis-sekcija">
          <textarea
            v-model="opisNacrt"
            class="modal-opis-textarea"
            placeholder="Napiši opis uz aktivnost (vidljivo u feedu)..."
            maxlength="500"
          ></textarea>
          <button class="gumb-spremi-opis" @click="spremiOpis(odabranaAktivnost)" :disabled="spremanjeOpisa">
            {{ spremanjeOpisa ? 'Spremam...' : 'Spremi opis' }}
          </button>
        </div>

        <div class="modal-stats">
          <div class="modal-stat">
            <span class="modal-stat-broj">{{ (odabranaAktivnost.udaljenost / 1000).toFixed(2) }}</span>
            <span class="modal-stat-label">Kilometri</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-broj">{{ formatirajVrijeme(odabranaAktivnost.trajanje) }}</span>
            <span class="modal-stat-label">Trajanje</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-broj">{{ (odabranaAktivnost.prosjecnaBrzina * 3.6).toFixed(1) }}</span>
            <span class="modal-stat-label">km/h prosjek</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-broj">{{ (odabranaAktivnost.maxBrzina * 3.6).toFixed(1) }}</span>
            <span class="modal-stat-label">km/h max</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-broj">{{ odabranaAktivnost.visinskaRazlika ?? '—' }}</span>
            <span class="modal-stat-label">m visinska razlika</span>
          </div>
          <div class="modal-stat">
            <span class="modal-stat-broj">{{ odabranaAktivnost.kalorije ?? '—' }}</span>
            <span class="modal-stat-label">kcal</span>
          </div>
          <div v-if="odabranaAktivnost.prosjecniPuls" class="modal-stat">
            <span class="modal-stat-broj">{{ Math.round(odabranaAktivnost.prosjecniPuls) }}</span>
            <span class="modal-stat-label">prosjek pulsa</span>
          </div>
          <div v-if="odabranaAktivnost.maxPuls" class="modal-stat">
            <span class="modal-stat-broj">{{ Math.round(odabranaAktivnost.maxPuls) }}</span>
            <span class="modal-stat-label">max puls</span>
          </div>
          <div v-if="odabranaAktivnost.elevMax != null" class="modal-stat">
            <span class="modal-stat-broj">{{ Math.round(odabranaAktivnost.elevMax) }}</span>
            <span class="modal-stat-label">m najviša točka</span>
          </div>
          <div v-if="odabranaAktivnost.elevMin != null" class="modal-stat">
            <span class="modal-stat-broj">{{ Math.round(odabranaAktivnost.elevMin) }}</span>
            <span class="modal-stat-label">m najniža točka</span>
          </div>
        </div>

        <div v-if="odabranaAktivnost.uredjaj" class="modal-oprema">
          <span>{{ odabranaAktivnost.uredjaj }}</span>
        </div>

        <div v-if="odabranaAktivnost.polyline" class="modal-karta-wrap">
          <div :id="`karta-${odabranaAktivnost.stravaId}`" class="modal-karta-div"></div>
        </div>
        <button v-if="odabranaAktivnost.polyline" class="gumb-preuzmi-sliku" @click="preuzmiKaoSliku(odabranaAktivnost)" :disabled="preuzimanjeSlike">
          {{ preuzimanjeSlike ? 'Pripremam sliku...' : 'Preuzmi za dijeljenje (JPG)' }}
        </button>
        <div v-else class="modal-nema-karte">Karta rute nije dostupna za ovu aktivnost.</div>

        <div v-if="odabranaAktivnost.splits?.length > 1" class="modal-tablica-wrap">
          <div class="modal-tablica-naslov">SPLITOVI PO KILOMETRU</div>
          <table class="modal-tablica">
            <thead>
              <tr><th>Km</th><th>Vrijeme</th><th>km/h</th></tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in odabranaAktivnost.splits" :key="i">
                <td>{{ i + 1 }}</td>
                <td>{{ formatirajVrijeme(s.trajanje) }}</td>
                <td>{{ (s.brzina * 3.6).toFixed(1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="odabranaAktivnost.rekordi?.length > 0" class="modal-rekordi">
          <div class="modal-tablica-naslov">REKORDI NA SEGMENTIMA</div>
          <div v-for="(r, i) in odabranaAktivnost.rekordi" :key="i" class="modal-rekord-red">
            <span class="modal-rekord-badge">{{ r.rekord === 1 ? 'PR' : `#${r.rekord}` }}</span>
            <span class="modal-rekord-naziv">{{ r.naziv }}</span>
            <span class="modal-rekord-vrijeme">{{ formatirajVrijeme(r.trajanje) }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';
import { tipIkona, formatirajDatum, formatirajDatumPuni, formatirajVrijeme, dekodirajPolyline, ucitajSkriptu } from '../utils/aktivnosti.js';
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import BocnaNavigacija from '../components/BocnaNavigacija.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const aktivnosti = ref([]);
const stravaSpojeno = ref(false);
const ucitavanje = ref(false);
const syncing = ref(false);
const mobilniMeni = ref(false);
const prikazano = ref(10);
const aktivniPeriod = ref('ukupno');
const odabranaAktivnost = ref(null);
const preuzimanjeSlike = ref(false);
const opisNacrt = ref('');
const spremanjeOpisa = ref(false);
const tjedanOffset = ref(0);
const mjesecOffset = ref(0);
const godinaOffset = ref(0);

const periodi = [
  { kljuc: 'ukupno', naziv: 'Ukupno' },
  { kljuc: 'tjedno', naziv: 'Tjedno' },
  { kljuc: 'mjesecno', naziv: 'Mjesečno' },
  { kljuc: 'godisnje', naziv: 'Godišnje' },
];

const tipNazivi = {
  Run: 'Trčanje', Ride: 'Bicikl', Walk: 'Hodanje',
  Hike: 'Planinarenje', Swim: 'Plivanje', Workout: 'Trening',
};

const periodFiltrirane = computed(() => {
  const sad = new Date();
  let filtered = aktivnosti.value;

  if (aktivniPeriod.value === 'tjedno') {
    const poc = pocetakTjedna(tjedanOffset.value);
    const kraj = new Date(poc); kraj.setDate(kraj.getDate() + 7);
    filtered = filtered.filter(a => {
      const d = new Date(a.datum);
      return d >= poc && d < kraj;
    });
  } else if (aktivniPeriod.value === 'mjesecno') {
    const d = new Date(sad.getFullYear(), sad.getMonth() + miesecOffset(), 1);
    filtered = filtered.filter(a => {
      const ad = new Date(a.datum);
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
    });
  } else if (aktivniPeriod.value === 'godisnje') {
    const god = new Date().getFullYear() + godinaOffset.value;
    filtered = filtered.filter(a => new Date(a.datum).getFullYear() === god);
  }

  return filtered;
});

const filtrirane = computed(() => periodFiltrirane.value.slice(0, prikazano.value));

function miesecOffset() { return mjesecOffset.value; }

function pocetakTjedna(offset = 0) {
  const sad = new Date();
  const dan = sad.getDay();
  const diff = (dan === 0 ? -6 : 1 - dan);
  const poc = new Date(sad);
  poc.setDate(sad.getDate() + diff + offset * 7);
  poc.setHours(0, 0, 0, 0);
  return poc;
}

const nazivTjedna = computed(() => {
  const poc = pocetakTjedna(tjedanOffset.value);
  const kraj = new Date(poc); kraj.setDate(kraj.getDate() + 6);
  const br = tjedanBroj(poc);
  const fmt = (d) => `${d.getDate()}.${d.getMonth() + 1}`;
  return `Tjedan ${br} · ${fmt(poc)} - ${fmt(kraj)}.${kraj.getFullYear()}`;
});

function tjedanBroj(d) {
  const poc = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - poc) / 86400000) + poc.getDay() + 1) / 7);
}

const dnevneAktivnosti = computed(() => {
  const dani = ['PON', 'UTO', 'SRI', 'ČET', 'PET', 'SUB', 'NED'];
  const poc = pocetakTjedna(tjedanOffset.value);
  const sveTjedna = aktivnosti.value.filter(a => {
    const d = new Date(a.datum);
    const kraj = new Date(poc); kraj.setDate(kraj.getDate() + 7);
    return d >= poc && d < kraj;
  });

  const trajanjaPoDanu = dani.map((_, i) => {
    const datum = new Date(poc); datum.setDate(poc.getDate() + i);
    const dnevne = sveTjedna.filter(a => {
      const d = new Date(a.datum);
      return d.getDate() === datum.getDate() && d.getMonth() === datum.getMonth();
    });
    return Math.round(dnevne.reduce((s, a) => s + (a.trajanje || 0), 0) / 60);
  });

  const maxTrajanje = Math.max(...trajanjaPoDanu, 1);

  return dani.map((dan, i) => {
    const datum = new Date(poc); datum.setDate(poc.getDate() + i);
    const trajanje = trajanjaPoDanu[i];
    return {
      dan,
      datum: `${datum.getDate()}.${datum.getMonth() + 1}`,
      trajanje,
      visina: Math.round((trajanje / maxTrajanje) * 100) || 0,
      kljuc: i,
    };
  });
});

const nazivMjeseca = computed(() => {
  const sad = new Date();
  const d = new Date(sad.getFullYear(), sad.getMonth() + miesecOffset(), 1);
  return d.toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' });
});

const kalendarDani = computed(() => {
  const sad = new Date();
  const d = new Date(sad.getFullYear(), sad.getMonth() + miesecOffset(), 1);
  const godina = d.getFullYear();
  const mjesec = d.getMonth();
  const prvidan = new Date(godina, mjesec, 1).getDay();
  const offset = prvidan === 0 ? 6 : prvidan - 1;
  const ukupno = new Date(godina, mjesec + 1, 0).getDate();
  const danas = new Date();

  const dani = [];
  for (let i = 0; i < offset; i++) dani.push({ broj: null, aktivnosti: [], danas: false });
  for (let i = 1; i <= ukupno; i++) {
    const danAkt = aktivnosti.value.filter(a => {
      const ad = new Date(a.datum);
      return ad.getDate() === i && ad.getMonth() === mjesec && ad.getFullYear() === godina;
    });
    const jeDanas = danas.getDate() === i && danas.getMonth() === mjesec && danas.getFullYear() === godina;
    dani.push({ broj: i, aktivnosti: danAkt, danas: jeDanas });
  }
  return dani;
});

const trenutnaGodina = computed(() => new Date().getFullYear() + godinaOffset.value);

const godisnjAktivnosti = computed(() => {
  const god = trenutnaGodina.value;
  return aktivnosti.value.filter(a => new Date(a.datum).getFullYear() === god);
});

const mjesecneAktivnosti = computed(() => {
  const nazivi = ['SIJ','VEL','OŽU','TRA','SVI','LIP','SRP','KOL','RUJ','LIS','STU','PRO'];
  const kmPoMjesecu = nazivi.map((_, i) =>
    godisnjAktivnosti.value
      .filter(a => new Date(a.datum).getMonth() === i)
      .reduce((s, a) => s + (a.udaljenost || 0), 0) / 1000
  );
  const maxKm = Math.max(...kmPoMjesecu, 1);
  return nazivi.map((naziv, i) => ({
    naziv,
    km: kmPoMjesecu[i],
    visina: Math.round((kmPoMjesecu[i] / maxKm) * 100) || 0,
    kljuc: i,
  }));
});

const tipoviGodisnje = computed(() => {
  const tipovi = {};
  godisnjAktivnosti.value.forEach(a => { tipovi[a.tip] = (tipovi[a.tip] || 0) + 1; });
  const ukupno = godisnjAktivnosti.value.length || 1;
  return Object.entries(tipovi)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tip, broj]) => ({ tip, broj, postotak: Math.round((broj / ukupno) * 100) }));
});

const godisnjeStats = computed(() => {
  const akt = godisnjAktivnosti.value;
  if (!akt.length) return { streak: 0, prosjecnoTjedno: 0, najaktivnijiDan: '—', najaktivnijiDanBroj: 0, najaktivnijiMjesec: '—', najaktivnijiMjesecBroj: 0, najduziTrening: 0, prosjecnoTrajanje: 0, prosjecnoKm: 0, najcesciTip: '—' };

  const dani = ['Nedjelja','Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota'];
  const mjNazivi = ['Siječanj','Veljača','Ožujak','Travanj','Svibanj','Lipanj','Srpanj','Kolovoz','Rujan','Listopad','Studeni','Prosinac'];

  const danBrojevi = Array(7).fill(0);
  const mjBrojevi = Array(12).fill(0);
  akt.forEach(a => {
    const d = new Date(a.datum);
    danBrojevi[d.getDay()]++;
    mjBrojevi[d.getMonth()]++;
  });

  const najDanIdx = danBrojevi.indexOf(Math.max(...danBrojevi));
  const najMjIdx = mjBrojevi.indexOf(Math.max(...mjBrojevi));

  const tipovi = {};
  akt.forEach(a => { tipovi[a.tip] = (tipovi[a.tip] || 0) + 1; });
  const najcesciTip = Object.entries(tipovi).sort((a,b) => b[1]-a[1])[0];

  const sortedDatumi = [...new Set(akt.map(a => new Date(a.datum).toDateString()))].sort();
  let maxStreak = 0, streak = 0;
  for (let i = 0; i < sortedDatumi.length; i++) {
    if (i === 0) { streak = 1; continue; }
    const diff = (new Date(sortedDatumi[i]) - new Date(sortedDatumi[i-1])) / 86400000;
    streak = diff === 1 ? streak + 1 : 1;
    maxStreak = Math.max(maxStreak, streak);
  }

  return {
    streak: maxStreak,
    prosjecnoTjedno: (akt.length / 52).toFixed(1),
    najaktivnijiDan: dani[najDanIdx],
    najaktivnijiDanBroj: danBrojevi[najDanIdx],
    najaktivnijiMjesec: mjNazivi[najMjIdx],
    najaktivnijiMjesecBroj: mjBrojevi[najMjIdx],
    najduziTrening: (Math.max(...akt.map(a => a.trajanje || 0)) / 3600).toFixed(1),
    prosjecnoTrajanje: Math.round(akt.reduce((s,a) => s + (a.trajanje||0), 0) / akt.length / 60),
    prosjecnoKm: (akt.reduce((s,a) => s + (a.udaljenost||0), 0) / akt.length / 1000).toFixed(1),
    najcesciTip: tipNazivi[najcesciTip?.[0]] || najcesciTip?.[0] || '—',
  };
});
const ukupnoKm = computed(() =>
  (periodFiltrirane.value.reduce((s, a) => s + (a.udaljenost || 0), 0) / 1000).toFixed(1)
);

const ukupnoVrijeme = computed(() => {
  const sek = periodFiltrirane.value.reduce((s, a) => s + (a.trajanje || 0), 0);
  const h = Math.floor(sek / 3600);
  const m = Math.floor((sek % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
});

const ukupnoKalorije = computed(() =>
  periodFiltrirane.value.reduce((s, a) => s + (a.kalorije || 0), 0)
);

const donutSegmenti = computed(() => {
  const tipovi = {};
  periodFiltrirane.value.forEach(a => { tipovi[a.tip] = (tipovi[a.tip] || 0) + a.udaljenost; });
  const ukupno = Object.values(tipovi).reduce((s, v) => s + v, 0) || 1;
  const boje = { Run: '#f5c800', Ride: '#fc4c02', Walk: '#4a9eff', Hike: '#4affb0', Swim: '#ff4a6b', Workout: '#b44aff' };
  let offset = -70.75;
  return Object.entries(tipovi).map(([tip, dist]) => {
    const postotak = Math.round((dist / ukupno) * 100);
    const duljina = (postotak / 100) * 283;
    const segment = { tip: tipNazivi[tip] || tip, postotak, duljina, offset, boja: boje[tip] || '#888' };
    offset -= duljina;
    return segment;
  });
});

const sazetakPoTipu = computed(() => {
  const tipovi = {};
  periodFiltrirane.value.forEach(a => {
    if (!tipovi[a.tip]) tipovi[a.tip] = { broj: 0, udaljenost: 0, trajanje: 0 };
    tipovi[a.tip].broj++;
    tipovi[a.tip].udaljenost += a.udaljenost || 0;
    tipovi[a.tip].trajanje += a.trajanje || 0;
  });
  return Object.entries(tipovi)
    .map(([tip, v]) => ({
      tip,
      naziv: tipNazivi[tip] || tip,
      broj: v.broj,
      km: (v.udaljenost / 1000).toFixed(1),
      vrijeme: formatirajSate(v.trajanje),
    }))
    .sort((a, b) => b.broj - a.broj);
});

function formatirajSate(sek) {
  const h = Math.floor(sek / 3600);
  const m = Math.floor((sek % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
}

onMounted(async () => {
  const token = route.query.token;
  if (token) {
    await auth.postaviTokenIzURL(token);
    router.replace('/dashboard');
  }
  await dohvatiAktivnosti();
});

async function otvoriAktivnost(akt) {
  odabranaAktivnost.value = akt;
  opisNacrt.value = akt.opis || '';
  if (!akt.polyline) return;
  await nextTick();
  await new Promise(r => setTimeout(r, 200));
  try {
    await inicijalizirajKartu(akt);
  } catch (err) {
    console.error(err);
  }
}

async function inicijalizirajKartu(akt) {
  if (!window.L) {
    await ucitajSkriptu('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  const id = `karta-${akt.stravaId}`;
  const el = document.getElementById(id);
  if (!el) return;

  if (el._leaflet_id) {
    try { window.L.map(el).remove(); } catch(e) {}
    el._leaflet_id = null;
    el.innerHTML = '';
  }

  const karta = window.L.map(el, { zoomControl: true, attributionControl: false });
  window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(karta);
  const latlngs = dekodirajPolyline(akt.polyline);
  window.L.polyline(latlngs, { color: '#f5c800', weight: 4, opacity: 0.9 }).addTo(karta);
  karta.fitBounds(window.L.polyline(latlngs).getBounds(), { padding: [20, 20] });
}

function formatirajTempo(akt) {
  if (akt.tip === 'Ride') return `${(akt.prosjecnaBrzina * 3.6).toFixed(1)} km/h`;
  if (!akt.udaljenost) return '—';
  const sekPoKm = akt.trajanje / (akt.udaljenost / 1000);
  const min = Math.floor(sekPoKm / 60);
  const sek = Math.round(sekPoKm % 60);
  return `${min}:${String(sek).padStart(2, '0')} /km`;
}

function nacrtajZaobljeniPravokutnik(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function nacrtajRutu(ctx, latlngs, x0, y0, w, h) {
  const lats = latlngs.map(p => p[0]);
  const lngs = latlngs.map(p => p[1]);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const lngSkala = Math.cos(((minLat + maxLat) / 2) * Math.PI / 180) || 1;

  const rasponX = Math.max((maxLng - minLng) * lngSkala, 0.0001);
  const rasponY = Math.max(maxLat - minLat, 0.0001);
  const skala = Math.min(w / rasponX, h / rasponY);

  const offsetX = x0 + (w - rasponX * skala) / 2;
  const offsetY = y0 + (h - rasponY * skala) / 2;

  ctx.beginPath();
  latlngs.forEach(([lat, lng], i) => {
    const x = offsetX + (lng - minLng) * lngSkala * skala;
    const y = offsetY + (maxLat - lat) * skala;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#f5c800';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(245,200,0,0.4)';
  ctx.shadowBlur = 15;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#f5c800';
  const [startLat, startLng] = latlngs[0];
  const [endLat, endLng] = latlngs[latlngs.length - 1];
  const sx = offsetX + (startLng - minLng) * lngSkala * skala;
  const sy = offsetY + (maxLat - startLat) * skala;
  const ex = offsetX + (endLng - minLng) * lngSkala * skala;
  const ey = offsetY + (maxLat - endLat) * skala;
  ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(ex, ey, 9, 0, Math.PI * 2); ctx.fill();
}

async function preuzmiKaoSliku(akt) {
  preuzimanjeSlike.value = true;
  try {
    const latlngs = dekodirajPolyline(akt.polyline);
    if (!latlngs.length) return;

    if (document.fonts?.ready) await document.fonts.ready;

    const sirina = 1080, visina = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = sirina; canvas.height = visina;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#232323';
    ctx.fillRect(0, 0, sirina, visina);

    nacrtajZaobljeniPravokutnik(ctx, 60, 290, sirina - 120, 620, 24);
    ctx.fillStyle = '#3a3a3a';
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 34px Barlow, sans-serif';
    ctx.fillText(tipIkona(akt.tip) + ' ' + akt.tip, 60, 100);

    ctx.fillStyle = '#fff';
    ctx.font = '800 62px "Barlow Condensed", sans-serif';
    ctx.fillText(akt.naziv || '', 60, 175, sirina - 120);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '400 30px Barlow, sans-serif';
    ctx.fillText(formatirajDatumPuni(akt.datum), 60, 220);

    nacrtajRutu(ctx, latlngs, 100, 330, sirina - 200, 540);

    const statovi = [
      { broj: (akt.udaljenost / 1000).toFixed(2), label: 'KM' },
      { broj: formatirajVrijeme(akt.trajanje), label: 'VRIJEME' },
      { broj: formatirajTempo(akt), label: akt.tip === 'Ride' ? 'PROSJEK' : 'TEMPO' },
    ];

    const statW = (sirina - 120) / statovi.length;
    statovi.forEach((s, i) => {
      const x = 60 + i * statW;
      ctx.fillStyle = '#f5c800';
      ctx.font = '800 58px "Barlow Condensed", sans-serif';
      ctx.fillText(s.broj, x, visina - 150);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '700 24px "Barlow Condensed", sans-serif';
      ctx.fillText(s.label, x, visina - 110);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '600 26px "Barlow Condensed", sans-serif';
    ctx.fillText('TERETANA INSPECTOR', 60, visina - 40);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const naziv = (akt.naziv || 'ruta').replace(/[\\/:*?"<>|]/g, '_');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${naziv}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  } finally {
    preuzimanjeSlike.value = false;
  }
}

async function dohvatiAktivnosti() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/strava/aktivnosti?velicina=5000');
    aktivnosti.value = data.aktivnosti || [];
    stravaSpojeno.value = data.stravaSpojeno;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

async function promijeniFeedStatus(akt) {
  const novaVrijednost = !akt.uFeedu;
  akt.uFeedu = novaVrijednost;
  try {
    await api.patch(`/strava/aktivnost/${akt._id}/feed`, { uFeedu: novaVrijednost });
  } catch (err) {
    akt.uFeedu = !novaVrijednost;
    console.error(err);
  }
}

async function spremiOpis(akt) {
  spremanjeOpisa.value = true;
  try {
    await api.patch(`/strava/aktivnost/${akt._id}/feed`, { opis: opisNacrt.value });
    akt.opis = opisNacrt.value;
  } catch (err) {
    console.error(err);
  } finally {
    spremanjeOpisa.value = false;
  }
}

async function sinkroniziraj() {
  syncing.value = true;
  try {
    await api.post('/strava/sync');
    await dohvatiAktivnosti();
  } catch (err) {
    console.error(err);
  } finally {
    syncing.value = false;
  }
}

function spojiStravu() {
  const token = localStorage.getItem('token') || '';
  window.location.href = `${import.meta.env.VITE_API_URL}/strava/connect?token=${token}`;
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

* {
  box-sizing: border-box;
}

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

.logo-img {
  width: 85px;
  height: 85px;
  object-fit: contain;
}

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

.nav-item.active,
.nav-item:hover {
  background: rgba(0,0,0,0.1);
}

.sidebar-korisnik {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.1rem 1.35rem;
  border-top: 1px solid rgba(0,0,0,0.1);
}

.korisnik-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0,0,0,0.2);
  flex-shrink: 0;
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

.korisnik-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  overflow: hidden;
}

.korisnik-ime {
  color: #1a1a1a;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gumb-odjava {
  background: none;
  border: none;
  color: rgba(0,0,0,0.5);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  font-family: 'Barlow', sans-serif;
}

.gumb-odjava:hover {
  color: #1a1a1a;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.hamburger span {
  display: block;
  width: 24px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}

.header-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.7rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.05em;
  margin: 0;
}

.ikona-gumb {
  background: rgba(255,255,255,0.06);
  border: none;
  color: rgba(255,255,255,0.5);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.ikona-gumb:hover {
  background: rgba(245,200,0,0.15);
  color: #f5c800;
}
.glavni {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.period-filter {
  display: flex;
  gap: 0.6rem;
  padding: 1.25rem 2rem;
  flex-wrap: wrap;
}

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

.period-gumb:hover {
  border-color: rgba(245,200,0,0.3);
  color: #fff;
}

.period-aktivan {
  background: #f5c800;
  border-color: #f5c800;
  color: #1a1a1a;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin: 0 2rem 1.5rem;
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
  color: #f5c800;
}

.stat-label {
  color: rgba(255,255,255,0.4);
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.navigacija-period {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0 2rem 1rem;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
}

.nav-strelica {
  background: rgba(255,255,255,0.08);
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.nav-strelica:hover:not(:disabled) {
  background: #f5c800;
  color: #1a1a1a;
}

.nav-strelica:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
}

.bar-chart-kartica {
  margin: 0 2rem 1.5rem;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.5rem;
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
  height: 140px;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.bar-trajanje {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
  height: 16px;
  text-align: center;
}

.bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  background: rgba(255,255,255,0.04);
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  min-height: 80px;
}

.bar {
  width: 100%;
  background: rgba(255,255,255,0.1);
  border-radius: 4px 4px 0 0;
  transition: height 0.4s ease;
  min-height: 2px;
}

.bar-aktivan {
  background: #f5c800;
}

.bar-dan {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}

.bar-datum {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.3);
}

.kalendar-kartica {
  margin: 0 2rem 1.5rem;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.25rem;
}

.kalendar-dani-zaglavlje {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.kalendar-dani-zaglavlje span {
  text-align: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.05em;
  padding: 0.4rem 0;
}

.kalendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.kalendar-dan {
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  transition: border-color 0.2s;
  cursor: default;
}

.kalendar-prazan {
  background: transparent;
  border: none;
}

.kalendar-ima-aktivnost {
  background: rgba(245,200,0,0.12);
  border-color: rgba(245,200,0,0.3);
  cursor: pointer;
}

.kalendar-danas {
  border-color: #f5c800 !important;
}

.kalendar-broj {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(255,255,255,0.5);
}

.kalendar-ima-aktivnost .kalendar-broj {
  color: #fff;
}

.kalendar-ikona {
  font-size: 0.85rem;
  line-height: 1;
}

.tipovi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin: 0 2rem 1.5rem;
}

.tip-box {
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tip-ikona {
  font-size: 1.4rem;
}

.tip-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

.tip-broj {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.tip-trend {
  font-size: 0.78rem;
  color: #4ade80;
  margin-top: 0.2rem;
}

.dodatne-kartica {
  margin: 0 2rem 1.5rem;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 1.5rem;
}

.dodatne-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.1em;
  margin-bottom: 1.1rem;
}

.dodatne-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.dodatna-box {
  background: #1e1e1e;
  border-radius: 10px;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dodatna-broj {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f5c800;
  line-height: 1;
}

.dodatna-label {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.4);
  margin-top: 0.2rem;
}

.dodatna-sub {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.25);
}
.sazetak-kartica {
  margin: 0 2rem 1.5rem;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
}

.donut-wrap {
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.donut-svg {
  width: 130px;
  height: 130px;
  transform: rotate(-90deg);
  flex-shrink: 0;
}

.donut-svg-veci {
  width: 180px;
  height: 180px;
}

.sazetak-tablica {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Barlow', sans-serif;
}

.sazetak-tablica th {
  text-align: left;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.4);
  padding: 0 0.75rem 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.sazetak-tablica td {
  padding: 0.7rem 0.75rem;
  font-size: 0.95rem;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sazetak-tablica tr:last-child td {
  border-bottom: none;
}

.sazetak-tablica th:not(:first-child),
.sazetak-tablica td:not(:first-child) {
  text-align: right;
}

.sazetak-sport {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.donut-legenda {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.legenda-stavka {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legenda-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legenda-tekst {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.65);
}

.strava-banner {
  margin: 0 2rem 1.25rem;
  background: rgba(252,76,2,0.1);
  border: 1px solid rgba(252,76,2,0.3);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.95rem;
  color: rgba(255,255,255,0.6);
}

.gumb-spoji {
  background: #fc4c02;
  border: none;
  color: #fff;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  font-size: 0.95rem;
}


.aktivnosti-sekcija {
  margin: 0 2rem 2rem;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 16px;
  overflow: hidden;
}

.aktivnosti-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.05em;
}

.sync-gumb {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.4);
  padding: 0.35rem 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Barlow', sans-serif;
  transition: border-color 0.2s, color 0.2s;
}

.sync-gumb:hover:not(:disabled) {
  border-color: #f5c800;
  color: #f5c800;
}

.sync-gumb:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes rotacija {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.rotiraj {
  animation: rotacija 0.8s linear infinite;
}

.prazno {
  padding: 2.5rem;
  text-align: center;
  color: rgba(255,255,255,0.25);
  font-size: 0.95rem;
}

.aktivnost-red {
  display: flex;
  align-items: center;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  gap: 1rem;
  transition: background 0.15s;
  cursor: pointer;
}

.aktivnost-red:last-of-type {
  border-bottom: none;
}

.aktivnost-red:hover {
  background: rgba(245,200,0,0.05);
}

.akt-tip {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.akt-ikona {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.akt-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.akt-km {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: #f5c800;
  flex-shrink: 0;
  min-width: 75px;
  text-align: right;
}

.akt-datum {
  color: rgba(255,255,255,0.35);
  font-size: 0.88rem;
  flex-shrink: 0;
  min-width: 90px;
  text-align: right;
}

.feed-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
  flex-shrink: 0;
  cursor: pointer;
}

.feed-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.feed-toggle-klizac {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.12);
  border-radius: 22px;
  transition: background 0.2s;
}

.feed-toggle-klizac::before {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
}

.feed-toggle input:checked + .feed-toggle-klizac {
  background: #f5c800;
}

.feed-toggle input:checked + .feed-toggle-klizac::before {
  transform: translateX(18px);
}

.gumb-vise {
  display: block;
  width: calc(100% - 3rem);
  margin: 1.1rem 1.5rem;
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.85rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: background 0.2s;
}

.gumb-vise:hover {
  background: #ffd700;
}

.ucitavanje {
  display: flex;
  justify-content: center;
  padding: 5rem;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(245,200,0,0.2);
  border-top-color: #f5c800;
  border-radius: 50%;
  animation: rotacija 0.8s linear infinite;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 90;
  display: none;
}


.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: #252525;
  border: 1px solid rgba(245,200,0,0.2);
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: ulaziModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ulaziModal {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

.modal-zatvori {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.5);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-zatvori:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.modal-zaglavlje {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
  padding-right: 2.5rem;
}

.modal-ikona-velika {
  font-size: 2.5rem;
}

.modal-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.2rem;
}

.modal-tip-datum {
  color: rgba(255,255,255,0.4);
  font-size: 0.88rem;
}

.modal-feed-sekcija {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.modal-feed-label {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.6);
}

.modal-opis-sekcija {
  margin-bottom: 1.5rem;
}

.modal-opis-textarea {
  width: 100%;
  min-height: 70px;
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #fff;
  padding: 0.75rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 0.6rem;
}

.modal-opis-textarea:focus {
  outline: none;
  border-color: #f5c800;
}

.gumb-spremi-opis {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.gumb-spremi-opis:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.modal-stat {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.modal-stat-broj {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: #f5c800;
}

.modal-stat-label {
  color: rgba(255,255,255,0.35);
  font-size: 0.78rem;
  text-align: center;
}

.modal-oprema {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  color: rgba(255,255,255,0.45);
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
}

.modal-tablica-wrap {
  margin-top: 1.5rem;
}

.modal-tablica-naslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.08em;
  margin-bottom: 0.6rem;
}

.modal-tablica {
  width: 100%;
  border-collapse: collapse;
}

.modal-tablica th {
  text-align: left;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
  padding: 0 0.5rem 0.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.modal-tablica td {
  padding: 0.5rem;
  font-size: 0.88rem;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.modal-tablica th:not(:first-child),
.modal-tablica td:not(:first-child) {
  text-align: right;
}

.modal-rekordi {
  margin-top: 1.5rem;
}

.modal-rekord-red {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.modal-rekord-badge {
  background: rgba(245,200,0,0.15);
  color: #f5c800;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  flex-shrink: 0;
}

.modal-rekord-naziv {
  flex: 1;
  font-size: 0.88rem;
  color: #fff;
}

.modal-rekord-vrijeme {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.4);
}

.modal-karta-wrap {
  border-radius: 12px;
  overflow: hidden;
}

.gumb-preuzmi-sliku {
  display: block;
  width: 100%;
  margin-top: 0.75rem;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.1);
  color: #fff;
  padding: 0.75rem;
  border-radius: 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.gumb-preuzmi-sliku:hover:not(:disabled) {
  border-color: #f5c800;
  color: #f5c800;
}

.gumb-preuzmi-sliku:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-karta-div {
  width: 100%;
  height: 250px;
}

.modal-nema-karte {
  background: #1e1e1e;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  color: rgba(255,255,255,0.25);
  font-size: 0.88rem;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .overlay {
    display: block;
  }

  .hamburger {
    display: flex;
  }

  .header {
    padding: 1.1rem 1.25rem;
  }

  .stats-row {
    grid-template-columns: repeat(2, 1fr);
    margin: 0 1rem 1rem;
  }

  .navigacija-period {
    margin: 0 1rem 0.75rem;
  }

  .bar-chart-kartica {
    margin: 0 1rem 1.25rem;
    padding: 1.1rem;
  }

  .kalendar-kartica {
    margin: 0 1rem 1.25rem;
    padding: 1rem;
  }

  .kalendar-dan {
    border-radius: 6px;
  }

  .sazetak-kartica {
    margin: 0 1rem 1.25rem;
  }

  .donut-wrap {
    flex-direction: column;
    gap: 1rem;
  }

  .tipovi-grid {
    grid-template-columns: repeat(2, 1fr);
    margin: 0 1rem 1rem;
  }

  .dodatne-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dodatne-kartica {
    margin: 0 1rem 1.25rem;
  }

  .aktivnosti-sekcija {
    margin: 0 1rem 2rem;
  }

  .aktivnost-red {
    padding: 0.9rem 1.1rem;
  }

  .akt-datum {
    display: none;
  }

  .gumb-vise {
    width: calc(100% - 2rem);
    margin: 0.9rem 1rem;
  }

  .modal-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal {
    padding: 1.5rem;
  }

  .period-filter {
    padding: 0.85rem 1rem;
  }

  .period-gumb {
    padding: 0.5rem 1rem;
    font-size: 0.92rem;
  }

  .strava-banner {
    margin: 0 1rem 1rem;
  }
}
</style>