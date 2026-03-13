<template>
  <div class="stranica-auth">

    <div class="zuti-panel" :class="{ 'na-lijevo': jeRegistracija }">
      <img src="../assets/logo.png" class="logo-slika" alt="Teretana Inspector" />
    </div>

    <div class="mobitel-zaglavlje">
      <img src="../assets/logo.png" class="logo-mobitel" alt="Teretana Inspector" />
      <div class="naslov-mobitel">TERETANA INSPECTOR</div>
    </div>

    <div class="panel-forme lijevi" :class="{ 'sakrij': jeRegistracija }">
      <div class="sadrzaj-forme">
        <div class="naslov-app">TERETANA INSPECTOR</div>
        <form class="forma" @submit.prevent="handlePrijava">
          <div class="polje-forme">
            <input v-model="prijavaForma.email" type="email" class="unos-polja" placeholder="EMAIL" required autocomplete="email" />
          </div>
          <div class="polje-forme polje-lozinka">
            <input v-model="prijavaForma.lozinka" :type="prikaziLozinku1 ? 'text' : 'password'" class="unos-polja" placeholder="LOZINKA" required autocomplete="current-password" />
            <button type="button" class="gumb-oko" @click="prikaziLozinku1 = !prikaziLozinku1">
              <svg v-if="!prikaziLozinku1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <div v-if="greska && !jeRegistracija" class="poruka-greska">{{ greska }}</div>
          <button type="submit" class="gumb-submit" :disabled="ucitavanje">
            {{ ucitavanje && !jeRegistracija ? 'PRIJAVA...' : 'PRIJAVA' }}
          </button>
        </form>
        <p class="tekst-link">
          Stvori račun
          <button class="link-gumb" @click="prebaci(true)">Registracija</button>
        </p>
      </div>
    </div>

    <div class="panel-forme desni" :class="{ 'sakrij': !jeRegistracija }">
      <div class="sadrzaj-forme">
        <div class="naslov-forma">REGISTRACIJA</div>
        <form class="forma" @submit.prevent="handleRegistracija">
          <div class="polje-forme">
            <input v-model="regForma.ime" type="text" class="unos-polja" placeholder="IME I PREZIME" required autocomplete="name" />
          </div>
          <div class="polje-forme">
            <input v-model="regForma.email" type="email" class="unos-polja" placeholder="EMAIL" required autocomplete="email" />
          </div>
          <div class="polje-forme polje-lozinka">
            <input v-model="regForma.lozinka" :type="prikaziLozinku2 ? 'text' : 'password'" class="unos-polja" placeholder="LOZINKA" required autocomplete="new-password" />
            <button type="button" class="gumb-oko" @click="prikaziLozinku2 = !prikaziLozinku2">
              <svg v-if="!prikaziLozinku2" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
          <div v-if="greska && jeRegistracija" class="poruka-greska">{{ greska }}</div>
          <button type="submit" class="gumb-submit" :disabled="ucitavanje">
            {{ ucitavanje && jeRegistracija ? 'REGISTRACIJA...' : 'REGISTRACIJA' }}
          </button>
        </form>
        <p class="tekst-link">
          Nazad na
          <button class="link-gumb" @click="prebaci(false)">Login</button>
        </p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';

const router = useRouter();
const auth = useAuthStore();

const jeRegistracija = ref(false);
const prikaziLozinku1 = ref(false);
const prikaziLozinku2 = ref(false);
const greska = ref('');
const ucitavanje = ref(false);

const prijavaForma = ref({ email: '', lozinka: '' });
const regForma = ref({ ime: '', email: '', lozinka: '' });

function prebaci(naRegistraciju) {
  greska.value = '';
  jeRegistracija.value = naRegistraciju;
}

async function handlePrijava() {
  greska.value = '';
  ucitavanje.value = true;
  try {
    const korisnik = await auth.prijava(prijavaForma.value.email, prijavaForma.value.lozinka);
    router.push(korisnik.uloga === 'admin' ? '/admin' : '/dashboard');
  } catch (error) {
    greska.value = error.response?.data?.poruka || 'Greška pri prijavi.';
  } finally {
    ucitavanje.value = false;
  }
}

async function handleRegistracija() {
  greska.value = '';
  ucitavanje.value = true;
  try {
    await auth.registracija(regForma.value.ime, regForma.value.email, regForma.value.lozinka);
    router.push('/odabir-prijave');
  } catch (error) {
    greska.value = error.response?.data?.poruka || 'Greška pri registraciji.';
  } finally {
    ucitavanje.value = false;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500&display=swap');

.stranica-auth {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  background: #1e1e1e;
  font-family: 'Barlow', sans-serif;
  overflow: hidden;
  position: relative;
}

.zuti-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 55%;
  right: 0;
  background: #f5c800;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  clip-path: polygon(7% 0%, 100% 0%, 100% 100%, 0% 100%);
  transform: translateX(0%);
  transition: transform 0.75s cubic-bezier(0.86, 0, 0.07, 1),
              clip-path 0.75s cubic-bezier(0.86, 0, 0.07, 1);
}

.zuti-panel.na-lijevo {
  transform: translateX(-81.8%);
  clip-path: polygon(0% 0%, 93% 0%, 100% 100%, 0% 100%);
}

.logo-slika {
  width: 400px;
  height: 400px;
  object-fit: contain;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.4));
}

.mobitel-zaglavlje {
  display: none;
}

.panel-forme {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 5;
  transition: opacity 0.3s ease;
}

.panel-forme.lijevi { left: 0; }
.panel-forme.desni  { right: 0; }

.panel-forme.sakrij {
  opacity: 0;
  pointer-events: none;
}

.sadrzaj-forme {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.naslov-app,
.naslov-forma {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  color: #ffffff;
  text-align: center;
  margin-bottom: 2.5rem;
}

.naslov-app  { font-size: 1.9rem; letter-spacing: 0.05em; }
.naslov-forma { font-size: 2.2rem; letter-spacing: 0.08em; }

.forma {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1.5rem;
}

.polje-forme { position: relative; }

.unos-polja {
  width: 100%;
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.22);
  border-radius: 8px;
  padding: 0.88rem 1.1rem;
  color: #fff;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;
  -webkit-appearance: none;
}
.unos-polja::placeholder { color: rgba(255,255,255,0.32); letter-spacing: 0.15em; }
.unos-polja:focus { border-color: #f5c800; background: rgba(245,200,0,0.04); }
.polje-lozinka .unos-polja { padding-right: 3rem; }

.gumb-oko {
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255,255,255,0.38);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.gumb-oko:hover { color: #f5c800; }

.gumb-submit {
  background: #f5c800;
  color: #1a1a1a;
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  cursor: pointer;
  margin-top: 0.25rem;
  transition: background 0.2s, transform 0.1s;
  width: 100%;
  -webkit-tap-highlight-color: transparent;
}
.gumb-submit:hover:not(:disabled) { background: #ffd700; transform: translateY(-1px); }
.gumb-submit:active:not(:disabled) { transform: scale(0.98); }
.gumb-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.poruka-greska {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5;
  padding: 0.65rem 0.9rem;
  border-radius: 6px;
  font-size: 0.85rem;
  width: 100%;
}

.tekst-link {
  color: rgba(255,255,255,0.5);
  font-size: 0.9rem;
  margin: 0;
  text-align: center;
}

.link-gumb {
  background: none;
  border: none;
  color: #f5c800;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.25rem;
  font-family: 'Barlow', sans-serif;
  -webkit-tap-highlight-color: transparent;
}
.link-gumb:hover { text-decoration: underline; }

@media (max-width: 700px) {
  .stranica-auth {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
  }

  .zuti-panel {
    display: none;
  }

  .mobitel-zaglavlje {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5c800;
    width: 100%;
    padding: 2rem 1rem 2.5rem;
    clip-path: polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%);
    padding-bottom: 3.5rem;
  }

  .logo-mobitel {
    width: 100px;
    height: 100px;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
    margin-bottom: 0.5rem;
  }

  .naslov-mobitel {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: 0.08em;
  }

  .panel-forme {
    position: relative;
    width: 100%;
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
    padding: 2rem 1.5rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .panel-forme.sakrij {
    display: none;
  }

  .sadrzaj-forme {
    max-width: 100%;
  }

  .naslov-app {
    display: none;
  }

  .naslov-forma {
    font-size: 1.8rem;
    margin-bottom: 1.75rem;
  }

  .unos-polja {
    font-size: 1rem;
    padding: 1rem 1.1rem;
  }

  .gumb-submit {
    padding: 1rem;
    font-size: 1rem;
  }
}
</style>