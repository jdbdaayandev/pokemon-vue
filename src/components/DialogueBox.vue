<template>
  <div v-if="store.dialogue.isOpen" class="dialogue-container">
    <div class="dialogue-box">
      <div class="npc-name">{{ store.dialogue.name }}</div>
      
      <div class="npc-text">
        {{ displayedText }}
      </div>
      
      <div class="blinking-arrow" v-if="!store.dialogue.isTyping && (hasNextLine || isLastLine)">▼</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();
const displayedText = ref(''); // Ang lalabas na text sa screen
let typewriterInterval = null;

// Kunin ang buong string na dapat i-type
const currentFullText = computed(() => {
  if (!store.dialogue.isOpen || store.dialogue.lines.length === 0) return '';
  return store.dialogue.lines[store.dialogue.currentLine];
});

const hasNextLine = computed(() => store.dialogue.currentLine < store.dialogue.lines.length - 1);
const isLastLine = computed(() => store.dialogue.currentLine === store.dialogue.lines.length - 1);

// --- 🔴 TYPEWRITER CORE LOGIC ---
const startTypewriter = () => {
  clearInterval(typewriterInterval); // Linisin ang lumang timer kung meron man
  displayedText.value = '';
  
  if (!currentFullText.value) return;

  let index = 0;
  const typingSpeed = 30; // Bilis ng bawat letra sa milliseconds (30ms ay saktong GBA speed)

  typewriterInterval = setInterval(() => {
    if (index < currentFullText.value.length) {
      displayedText.value += currentFullText.value[index];
      index++;
    } else {
      // Kapag natapos na ang lahat ng letra nang kusa
      clearInterval(typewriterInterval);
      store.dialogue.isTyping = false; 
    }
  }, typingSpeed);
};

// Bantayan kung lumipat ng linya o kakabukas lang ng dialogue box
watch([() => store.dialogue.currentLine, () => store.dialogue.isOpen], () => {
  if (store.dialogue.isOpen) {
    startTypewriter();
  } else {
    clearInterval(typewriterInterval);
    displayedText.value = '';
  }
},{ immediate: true });

// Bantayan kung pinilit patigilin ng Player ang pagta-type (Instant Complete Shortcut)
watch(() => store.dialogue.isTyping, (newVal) => {
  if (!newVal) {
    clearInterval(typewriterInterval);
    displayedText.value = currentFullText.value; // Ipakita agad ang buong text
  }
});

// Siguraduhing walang tatagas na timer kapag nawala ang component
onBeforeUnmount(() => {
  clearInterval(typewriterInterval);
});
</script>

<style scoped>
.dialogue-container {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 720px;
  z-index: 100;
  pointer-events: auto;
}

.dialogue-box {
  background-color: #f8f8f8;
  border: 4px solid #606060;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: inset 0 0 0 4px #d8d8d8, 0 8px 16px rgba(0,0,0,0.5);
  position: relative;
  font-family: 'Press Start 2P', monospace;
  min-height: 120px;
}

.npc-name {
  font-size: 14px;
  color: #e53935;
  margin-bottom: 12px;
  text-transform: uppercase;
  text-shadow: 1px 1px 0px #ccc;
}

.npc-text {
  font-size: 14px;
  color: #303030;
  line-height: 1.8;
}

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