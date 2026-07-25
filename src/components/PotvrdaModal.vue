<template>
  <div v-if="vidljivo" class="potvrda-overlay" @click.self="odbij">
    <div class="potvrda-kartica">
      <p class="potvrda-tekst">{{ poruka }}</p>
      <div class="potvrda-akcije">
        <button class="potvrda-ne" @click="odbij">Ne</button>
        <button class="potvrda-da" @click="prihvati">Da</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePotvrdaStanje, odgovoriNaPotvrdu } from '../composables/potvrda.js';

const { vidljivo, poruka } = usePotvrdaStanje();

function prihvati() {
  odgovoriNaPotvrdu(true);
}

function odbij() {
  odgovoriNaPotvrdu(false);
}
</script>

<style scoped>
.potvrda-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.potvrda-kartica {
  background: #252525;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 1.75rem;
  max-width: 360px;
  width: calc(100% - 2rem);
}

.potvrda-tekst {
  color: #fff;
  font-family: 'Barlow', sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 1.5rem;
}

.potvrda-akcije {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.potvrda-ne,
.potvrda-da {
  padding: 0.55rem 1.25rem;
  border-radius: 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
}

.potvrda-ne {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
}
.potvrda-ne:hover { border-color: rgba(255, 255, 255, 0.35); color: #fff; }

.potvrda-da {
  background: #ef4444;
  color: #fff;
}
.potvrda-da:hover { background: #dc2626; }
</style>
