<template>
  <div v-if="store.dialogue.isOpen" class="dialogue-container">
    <div class="dialogue-box">
      <div class="npc-name">{{ store.dialogue.name }}</div>
      
      <div class="npc-text">
        {{ store.dialogue.lines[store.dialogue.currentLine] }}
      </div>
      
      <div class="blinking-arrow" v-if="hasNextLine || isLastLine">▼</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();

// Para malaman kung may susunod pang pahina o kung ito na ang dulo
const hasNextLine = computed(() => store.dialogue.currentLine < store.dialogue.lines.length - 1);
const isLastLine = computed(() => store.dialogue.currentLine === store.dialogue.lines.length - 1);
</script>

<style scoped>
/* Pwesto ng container sa pinakababa ng UI layer */
.dialogue-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 720px;
  z-index: 100;
  pointer-events: auto; /* Para pwede i-click kung gagawin mong clickable sa susunod */
}

/* Istilo na parang GBA Pokémon Text Box */
.dialogue-box {
  background-color: #f8f8f8;
  border: 4px solid #606060;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: inset 0 0 0 4px #d8d8d8, 0 8px 16px rgba(0,0,0,0.5);
  position: relative;
  font-family: 'Press Start 2P', monospace; /* Gamitin natin ang retro font mo! */
  min-height: 120px; /* Sakto para sa 2-3 linya ng text */
}

/* Pangalan ng NPC na kulay pula/asul para madaling makita */
.npc-name {
  font-size: 14px;
  color: #e53935;
  margin-bottom: 12px;
  text-transform: uppercase;
  text-shadow: 1px 1px 0px #ccc;
}

/* Mismong text ng dialogue */
.npc-text {
  font-size: 14px;
  color: #303030;
  line-height: 1.8;
}

/* Kumukurap na arrow sa kanang ibaba */
.blinking-arrow {
  position: absolute;
  bottom: 15px;
  right: 20px;
  color: #e53935;
  font-size: 16px;
  animation: blink 1s infinite step-end;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>