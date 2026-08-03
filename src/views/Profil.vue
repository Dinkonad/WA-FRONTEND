<template>
  <div class="dashboard">

    <BocnaNavigacija :otvoren="mobilniMeni" />

    <div v-if="mobilniMeni" class="overlay" @click="mobilniMeni = false"></div>

    <main class="glavni">
      <header class="header">
        <button class="hamburger" @click="mobilniMeni = !mobilniMeni">
          <span></span><span></span><span></span>
        </button>
        <h1 class="header-naslov">Profil</h1>
        <ZaglavljeMeni />
      </header>

      <div class="sadrzaj">
        <div v-if="ucitavanje" class="ucitavanje"><div class="spinner"></div></div>

        <template v-else>
          <div class="profil-kartica">
            <div class="profil-vrh">
              <div class="profil-avatar-wrap" @click="$refs.profilSlikaInput.click()">
                <img v-if="prikaznaSlika" :src="prikaznaSlika" class="profil-avatar" />
                <div v-else class="profil-avatar-inicijali">{{ inicijali }}</div>
                <div class="profil-avatar-hover">
                  <span v-if="uploadSlikeUTijeku">Uploadam...</span>
                  <span v-else>Uredi</span>
                </div>
              </div>
              <input ref="profilSlikaInput" type="file" accept="image/*" class="upload-slika-input-skriveno" @change="uploadSlikuProfila" />
              <div class="profil-vrh-info">
                <h2>{{ profil.ime }}</h2>
                <span>Član od {{ formatirajDatum(profil.clanOd) }}</span>
              </div>
              <button v-if="!uredivanje" class="gumb-uredi" @click="otvoriUredivanje">Uredi profil</button>
            </div>

            <div v-if="!uredivanje" class="podaci-mreza">
              <div class="podatak">
                <span class="podatak-label">Ime i prezime</span>
                <span class="podatak-vrijednost">{{ profil.ime || '—' }}</span>
              </div>
              <div class="podatak">
                <span class="podatak-label">Datum rođenja</span>
                <span class="podatak-vrijednost">{{ profil.datumRodjenja ? formatirajDatum(profil.datumRodjenja) : '—' }}</span>
              </div>
              <div class="podatak">
                <span class="podatak-label">Spol</span>
                <span class="podatak-vrijednost">{{ profil.spol || '—' }}</span>
              </div>
              <div class="podatak">
                <span class="podatak-label">Telefonski broj</span>
                <span class="podatak-vrijednost">{{ profil.telefon || '—' }}</span>
              </div>
              <div class="podatak">
                <span class="podatak-label">Visina</span>
                <span class="podatak-vrijednost">{{ profil.visina ? `${profil.visina} cm` : '—' }}</span>
              </div>
              <div class="podatak">
                <span class="podatak-label">Težina</span>
                <span class="podatak-vrijednost">{{ profil.tezina ? `${profil.tezina} kg` : '—' }}</span>
              </div>
              <div class="podatak">
                <span class="podatak-label">Email adresa</span>
                <span class="podatak-vrijednost">{{ profil.email || '—' }}</span>
              </div>
              <div class="podatak">
                <span class="podatak-label">Adresa</span>
                <span class="podatak-vrijednost">{{ profil.adresa || '—' }}</span>
              </div>
            </div>

            <div v-else class="forma-uredivanja">
              <div class="podatak-forma">
                <label>Ime i prezime</label>
                <input v-model="forma.ime" />
              </div>
              <div class="podatak-forma">
                <label>Datum rođenja</label>
                <input v-model="forma.datumRodjenja" type="date" />
              </div>
              <div class="podatak-forma">
                <label>Spol</label>
                <select v-model="forma.spol">
                  <option value="">Odaberi</option>
                  <option value="M">Muško</option>
                  <option value="Ž">Žensko</option>
                </select>
              </div>
              <div class="podatak-forma">
                <label>Telefonski broj</label>
                <input v-model="forma.telefon" />
              </div>
              <div class="podatak-forma">
                <label>Visina (cm)</label>
                <input v-model.number="forma.visina" type="number" />
              </div>
              <div class="podatak-forma">
                <label>Težina (kg)</label>
                <input v-model.number="forma.tezina" type="number" />
              </div>
              <div class="podatak-forma podatak-forma-siroko">
                <label>Adresa</label>
                <input v-model="forma.adresa" placeholder="Ulica i broj, Grad" />
              </div>

              <div v-if="greska" class="poruka-greska">{{ greska }}</div>

              <div class="forma-akcije">
                <button class="gumb-spremi" :disabled="spremanje" @click="spremiProfil">{{ spremanje ? 'Spremam...' : 'Spremi' }}</button>
                <button class="gumb-otkazi" @click="uredivanje = false">Odustani</button>
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
import ZaglavljeMeni from '../components/ZaglavljeMeni.vue';
import BocnaNavigacija from '../components/BocnaNavigacija.vue';

const router = useRouter();
const auth = useAuthStore();

const mobilniMeni = ref(false);
const ucitavanje = ref(false);
const uredivanje = ref(false);
const spremanje = ref(false);
const greska = ref('');

const profil = ref({});
const forma = ref({});

const inicijali = computed(() => {
  const ime = profil.value.ime || '';
  return ime.split(' ').map(r => r[0]).join('').toUpperCase().slice(0, 2);
});

const prikaznaSlika = computed(() => profil.value.slika || auth.korisnik?.stravaProfilna);

const uploadSlikeUTijeku = ref(false);

async function uploadSlikuProfila(event) {
  const datoteka = event.target.files[0];
  if (!datoteka) return;

  const formData = new FormData();
  formData.append('slika', datoteka);

  uploadSlikeUTijeku.value = true;
  try {
    const { data } = await api.post('/korisnici/profil/slika', formData);
    profil.value.slika = data.slika;
    if (auth.korisnik) {
      auth.korisnik.slika = data.slika;
      localStorage.setItem('korisnik', JSON.stringify(auth.korisnik));
    }
  } catch (err) {
    console.error(err);
  } finally {
    uploadSlikeUTijeku.value = false;
    event.target.value = '';
  }
}

function formatirajDatum(datum) {
  const d = new Date(datum);
  const dan = String(d.getDate()).padStart(2, '0');
  const mjesec = String(d.getMonth() + 1).padStart(2, '0');
  return `${dan}/${mjesec}/${d.getFullYear()}`;
}

async function ucitajProfil() {
  ucitavanje.value = true;
  try {
    const { data } = await api.get('/korisnici/profil');
    profil.value = data.korisnik;
  } catch (err) {
    console.error(err);
  } finally {
    ucitavanje.value = false;
  }
}

function otvoriUredivanje() {
  forma.value = {
    ime: profil.value.ime || '',
    datumRodjenja: profil.value.datumRodjenja ? new Date(profil.value.datumRodjenja).toISOString().slice(0, 10) : '',
    spol: profil.value.spol || '',
    telefon: profil.value.telefon || '',
    visina: profil.value.visina || null,
    tezina: profil.value.tezina || null,
    adresa: profil.value.adresa || '',
  };
  greska.value = '';
  uredivanje.value = true;
}

async function spremiProfil() {
  if (!forma.value.ime.trim()) {
    greska.value = 'Ime ne može biti prazno.';
    return;
  }
  greska.value = '';
  spremanje.value = true;
  try {
    const { data } = await api.put('/korisnici/profil', forma.value);
    profil.value = { ...profil.value, ...data.korisnik };
    auth.korisnik = { ...auth.korisnik, ime: data.korisnik.ime };
    localStorage.setItem('korisnik', JSON.stringify(auth.korisnik));
    uredivanje.value = false;
  } catch (err) {
    greska.value = err.response?.data?.poruka || 'Greška pri spremanju.';
  } finally {
    spremanje.value = false;
  }
}

onMounted(() => {
  ucitajProfil();
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

.profil-kartica {
  background: #252525;
  border: 1px solid rgba(245,200,0,0.25);
  border-radius: 20px;
  padding: 2rem;
}

.profil-vrh {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}

.profil-avatar { width: 68px; height: 68px; border-radius: 50%; object-fit: cover; border: 2px solid #f5c800; }
.profil-avatar-inicijali {
  width: 68px; height: 68px; border-radius: 50%;
  background: #f5c800; color: #1a1a1a;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 1.4rem;
}

.profil-avatar-wrap {
  position: relative;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
}

.profil-avatar-hover {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.6);
  color: #f5c800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.profil-avatar-wrap:hover .profil-avatar-hover { opacity: 1; }

.upload-slika-input-skriveno { display: none; }

.profil-vrh-info { flex: 1; min-width: 0; }
.profil-vrh-info h2 {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.5rem; font-weight: 800; margin: 0 0 0.2rem; color: #f5c800;
}
.profil-vrh-info span { font-size: 0.85rem; color: rgba(255,255,255,0.4); }

.gumb-uredi {
  background: transparent;
  border: 1px solid rgba(245,200,0,0.4);
  color: #f5c800;
  padding: 0.55rem 1.1rem;
  border-radius: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.gumb-uredi:hover { background: rgba(245,200,0,0.1); }

.podaci-mreza {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.1rem;
}

.podatak { display: flex; flex-direction: column; gap: 0.3rem; }
.podatak-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
}
.podatak-vrijednost { font-size: 0.95rem; color: #fff; }

.forma-uredivanja {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.podatak-forma { display: flex; flex-direction: column; gap: 0.4rem; }
.podatak-forma-siroko { grid-column: 1 / -1; }
.podatak-forma label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
}
.podatak-forma input, .podatak-forma select {
  background: #1e1e1e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  padding: 0.6rem 0.8rem;
  font-family: 'Barlow', sans-serif;
  font-size: 0.9rem;
}
.podatak-forma input:focus, .podatak-forma select:focus { outline: none; border-color: #f5c800; }

.poruka-greska {
  grid-column: 1 / -1;
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  font-size: 0.85rem;
}

.forma-akcije { grid-column: 1 / -1; display: flex; gap: 0.6rem; }

.gumb-spremi {
  background: #f5c800;
  border: none;
  color: #1a1a1a;
  padding: 0.65rem 1.3rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  cursor: pointer;
}
.gumb-spremi:disabled { opacity: 0.5; cursor: not-allowed; }

.gumb-otkazi {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  padding: 0.65rem 1.3rem;
  border-radius: 8px;
  font-family: 'Barlow', sans-serif;
  cursor: pointer;
}

@media (max-width: 768px) {
  .overlay { display: block; }
  .hamburger { display: flex; }
  .header { padding: 1.1rem 1.25rem; }
  .sadrzaj { padding: 1rem; }
  .podaci-mreza, .forma-uredivanja { grid-template-columns: 1fr; }
}
</style>
