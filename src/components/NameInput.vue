<script setup>
import { ref } from 'vue';
// Import your Pinia store here if you have one
// import { usePlayerStore } from '@/stores/playerStore';

const playerName = ref('');

const submitName = () => {
  if (playerName.value.trim() === '') return; // Bawal ang blangko

  // 1. I-save ang pangalan sa Pinia (optional pero recommended)
  // const playerStore = usePlayerStore();
  // playerStore.setName(playerName.value.toUpperCase());

  // 2. Magpadala ng event sa Phaser na tapos na ang paggawa ng pangalan
  window.dispatchEvent(new CustomEvent('start-game', { 
    detail: { mapToLoad: 'OverworldScene' } 
  }));

  // 3. Itago na ang Vue Name Input interface
  // (Depende sa logic mo kung paano mo itinatago ang component na ito)
};
</script>

<template>
  <div class="name-input-overlay">
    <h2>WHAT IS YOUR NAME?</h2>
    <input v-model="playerName" type="text" maxlength="7" @keyup.enter="submitName" />
    <button @click="submitName">OK</button>
  </div>
</template>