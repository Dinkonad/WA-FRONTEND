<template>
  <div class="dashboard">

    <BocnaNavigacija aktivna="recepti" :otvoren="mobilniMeni" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Recepti</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <div v-else-if="!jePremium" class="zakljucano-kartica">
          <div class="zakljucano-ikona">🔒</div>
          <h2 class="zakljucano-naslov">Premium sadržaj</h2>
          <p class="zakljucano-tekst">Recepti i prehrana prilagođeni tebi dostupni su uz Premium članarinu.</p>
          <button class="gumb-nadogradi" @click="router.push('/clanarina')">Nadogradi na Premium</button>
        </div>

        <template v-else>
          <template v-if="korak === 'lista'">
            <div v-if="ucitavanjeRecepata" class="ucitavanje"><div class="spinner"></div></div>
            <div v-else-if="recepti.length === 0" class="placeholder-kartica">
              <h2 class="placeholder-naslov">Recepti uskoro dolaze</h2>
              <p class="placeholder-tekst">Ovdje će se pojaviti recepti i savjeti o prehrani.</p>
            </div>
            <div v-else class="recepti-grid">
              <button v-for="r in recepti" :key="r._id" class="recept-kartica" @click="otvoriRecept(r)">
                <div class="recept-slika-wrap">
                  <img v-if="r.slika" :src="r.slika" class="recept-slika" />
                  <div v-else class="recept-slika-prazna">🍽</div>
                </div>
                <div class="recept-info">
                  <span class="recept-naziv">{{ r.naziv }}</span>
                  <span v-if="r.porcije" class="recept-porcije">{{ r.porcije }}</span>
                </div>
              </button>
            </div>
          </template>

          <template v-else-if="korak === 'detalji' && odabraniRecept">
            <div class="recept-detalji-wrap">
              <button class="gumb-nazad" @click="korak = 'lista'">‹ Nazad</button>

              <div class="detalji-kartica">
                <img v-if="odabraniRecept.slika" :src="odabraniRecept.slika" class="detalji-slika" />
                <h2 class="detalji-naziv">{{ odabraniRecept.naziv }}</h2>
                <span v-if="odabraniRecept.porcije" class="detalji-porcije">{{ odabraniRecept.porcije }}</span>

                <div class="detalji-sekcija">
                  <div class="detalji-podnaslov">SASTOJCI</div>
                  <ul class="sastojci-lista">
                    <li v-for="(s, idx) in redoviTeksta(odabraniRecept.sastojci)" :key="idx">{{ s }}</li>
                  </ul>
                </div>

                <div class="detalji-sekcija">
                  <div class="detalji-podnaslov">PRIPREMA</div>
                  <ol class="priprema-lista">
                    <li v-for="(p, idx) in redoviTeksta(odabraniRecept.priprema)" :key="idx">{{ p }}</li>
                  </ol>
                </div>

                <div v-if="odabraniRecept.kalorije || odabraniRecept.proteini || odabraniRecept.ugljikohidrati || odabraniRecept.masti" class="detalji-sekcija">
                  <div class="detalji-podnaslov">NUTRITIVNA VRIJEDNOST (PO PORCIJI, OKVIRNO)</div>
                  <div class="nutritivna-red">
                    <span v-if="odabraniRecept.kalorije">Kalorije: {{ odabraniRecept.kalorije }}</span>
                    <span v-if="odabraniRecept.proteini">Proteini: {{ odabraniRecept.proteini }}</span>
                    <span v-if="odabraniRecept.ugljikohidrati">Ugljikohidrati: {{ odabraniRecept.ugljikohidrati }}</span>
                    <span v-if="odabraniRecept.masti">Masti: {{ odabraniRecept.masti }}</span>
                  </div>
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
import BocnaNavigacija from '../components/BocnaNavigacija.vue';
import api from '../services/api.js';

const router = useRouter();

const mobilniMeni = ref(false);
const ucitavanje = ref(false);
const mojZahtjev = ref(null);
const istekla = ref(false);
const korak = ref('lista');
const recepti = ref([]);
const ucitavanjeRecepata = ref(false);
const odabraniRecept = ref(null);

const jePremium = computed(() => mojZahtjev.value?.status === 'odobreno' && mojZahtjev.value?.plan === 'premium' && !istekla.value);

function redoviTeksta(tekst) {
  return (tekst || '').split('\n').map(r => r.trim()).filter(Boolean);
}

function otvoriRecept(r) {
  odabraniRecept.value = r;
  korak.value = 'detalji';
}

async function ucitajRecepte() {
  ucitavanjeRecepata.value = true;
  try {
    const { data } = await api.get('/recepti');
    recepti.value = data.recepti || [];
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanjeRecepata.value = false;
  }
}

async function ucitajMojZahtjev() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/clanarina/moja');
    mojZahtjev.value = data.zahtjev;
    istekla.value = data.istekla;
    if (jePremium.value) ucitajRecepte();
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

onMounted(() => {
  ucitajMojZahtjev();
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
.sadrzaj { padding: 1.5rem 2rem 2rem; max-width: 700px; width: 100%; margin: 0 auto; display: flex; }

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

.zakljucano-ikona { font-size: 3rem; margin-bottom: 1rem; }

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

.recepti-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.1rem;
  width: 100%;
}

.recept-kartica {
  display: flex;
  flex-direction: column;
  width: 100%;
  background: #252525;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  text-align: left;
  font-family: inherit;
  color: inherit;
  transition: border-color 0.2s;
}
.recept-kartica:hover { border-color: rgba(245,200,0,0.3); }

.recept-slika-wrap { width: 100%; height: 140px; background: #1e1e1e; }
.recept-slika { width: 100%; height: 100%; object-fit: cover; display: block; }
.recept-slika-prazna {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
}

.recept-info { padding: 0.8rem 0.9rem; display: flex; flex-direction: column; gap: 0.25rem; }
.recept-naziv { font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 1rem; }
.recept-porcije { font-size: 0.78rem; color: rgba(255,255,255,0.45); }

.recept-detalji-wrap { width: 100%; }

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
  padding: 1.5rem;
}

.detalji-slika {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.detalji-naziv {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  margin: 0 0 0.3rem;
}

.detalji-porcije { display: block; font-size: 0.85rem; color: rgba(255,255,255,0.45); margin-bottom: 1.25rem; }

.detalji-sekcija { margin-top: 1.25rem; }

.detalji-podnaslov {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #f5c800;
  letter-spacing: 0.06em;
  margin-bottom: 0.6rem;
}

.sastojci-lista, .priprema-lista {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.92rem;
  color: rgba(255,255,255,0.8);
  line-height: 1.4;
}

.nutritivna-red {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1.25rem;
  font-size: 0.88rem;
  color: rgba(255,255,255,0.7);
  background: #1e1e1e;
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
  .sadrzaj { padding: 1rem; }
}
</style>
