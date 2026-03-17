import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api.js';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null);
  const korisnik = ref(JSON.parse(localStorage.getItem('korisnik')) || null);

  const jePrijavljen = computed(() => !!token.value);
  const jeAdmin = computed(() => korisnik.value?.uloga === 'admin');

  async function prijava(email, lozinka) {
    const { data } = await api.post('/auth/sesija', { email, lozinka });
    spremiSesiju(data);
    return data.korisnik;
  }

  async function registracija(ime, email, lozinka) {
    const { data } = await api.post('/korisnici', { ime, email, lozinka });
    spremiSesiju(data);
    return data.korisnik;
  }

  async function dohvatiProfil() {
    const { data } = await api.get('/korisnici/profil');
    return data.korisnik;
  }

  function spremiSesiju(data) {
    token.value = data.token;
    korisnik.value = data.korisnik;
    localStorage.setItem('token', data.token);
    localStorage.setItem('korisnik', JSON.stringify(data.korisnik));
  }

  async function postaviTokenIzURL(jwt) {
    token.value = jwt;
    localStorage.setItem('token', jwt);
    try {
      const { data } = await api.get('/korisnici/profil');
      korisnik.value = {
        ...data.korisnik,
        stravaProfilna: data.korisnik?.strava?.profilnaSlika,
      };
      localStorage.setItem('korisnik', JSON.stringify(korisnik.value));
    } catch (e) {
      console.error(e);
    }
  }

  function odjava() {
    token.value = null;
    korisnik.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('korisnik');
  }

  return { token, korisnik, jePrijavljen, jeAdmin, prijava, registracija, dohvatiProfil, spremiSesiju, postaviTokenIzURL, odjava };
});