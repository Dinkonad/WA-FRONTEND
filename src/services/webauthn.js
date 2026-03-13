import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import api from './api.js';

export const podrzavaWebAuthn = () => browserSupportsWebAuthn();

export const postaviFaceId = async () => {
  const { data: opcije } = await api.get('/webauthn/registracija-opcije');
  const odgovor = await startRegistration({ optionsJSON: opcije });
  const { data } = await api.post('/webauthn/registracija-provjera', { odgovor });
  return data;
};

export const prijaviSeFaceIdom = async (email) => {
  const { data: opcije } = await api.post('/webauthn/prijava-opcije', { email });
  const odgovor = await startAuthentication({ optionsJSON: opcije });
  const { data } = await api.post('/webauthn/prijava-provjera', { email, odgovor });
  return data;
};

export const imaPostavljenFaceId = (email) => {
  return localStorage.getItem(`faceid_${email}`) === 'true';
};

export const zapamtiFaceId = (email) => {
  localStorage.setItem(`faceid_${email}`, 'true');
};

export const obrisiZapamceniFaceId = (email) => {
  localStorage.removeItem(`faceid_${email}`);
};