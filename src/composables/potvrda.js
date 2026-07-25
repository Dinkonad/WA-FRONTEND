import { ref } from 'vue';

const vidljivo = ref(false);
const poruka = ref('');
let resolveFn = null;

export function potvrdi(tekst) {
  poruka.value = tekst;
  vidljivo.value = true;
  return new Promise((resolve) => {
    resolveFn = resolve;
  });
}

export function odgovoriNaPotvrdu(vrijednost) {
  vidljivo.value = false;
  if (resolveFn) {
    resolveFn(vrijednost);
    resolveFn = null;
  }
}

export function usePotvrdaStanje() {
  return { vidljivo, poruka };
}
