<template>
  <div id="app-wrapper">
    
    <!-- 🎮 MGA CONSOLE DECALS & PALAMUTI -->
    <div class="top-decal-text">POKÉMON</div>
    <div class="pokeball-decal"></div>
    
    <div class="speaker-holes">
      <span></span><span></span><span></span><span></span><span></span>
    </div>

    <div class="action-buttons">
      <div class="btn btn-b">B</div>
      <div class="btn btn-a">A</div>
    </div>
    <!-- 🎮 END NG DECALS -->

    <!-- 1. PHASER GAME LAYER -->
    <div id="game-container"></div>

    <!-- 2. VUE UI LAYER -->
    <div id="ui-layer">
      <DialogueBox />
      <!-- NAME INPUT BOX -->
      <div v-if="showNameInput" class="name-input-modal">
        <div class="modal-content">
          <p>What is your name?</p>
          <input 
            v-model="tempName" 
            type="text" 
            maxlength="7" 
            @keyup.enter="confirmName"
            placeholder="NAME"
            autofocus
          />
          <button @click="confirmName">OK</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Phaser from 'phaser';
import { gameConfig } from './game/config';
import DialogueBox from './components/DialogueBox.vue';

let gameInstance = null;
const showNameInput = ref(false);
const tempName = ref('');

const handleNameInputEvent = () => {
  showNameInput.value = true;
};

onMounted(() => {
  gameInstance = new Phaser.Game(gameConfig);
  window.addEventListener('show-name-input', handleNameInputEvent);
});

onBeforeUnmount(() => {
  if (gameInstance) {
    gameInstance.destroy(true);
  }
  window.removeEventListener('show-name-input', handleNameInputEvent);
});

const confirmName = () => {
  if (tempName.value.trim() !== '') {
    showNameInput.value = false;
    
    // ITO ANG KULANG: Magpadala ng signal sa Phaser na tapos na ang pangalan
    window.dispatchEvent(new CustomEvent('start-game'));
  }
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #1a1a1a; 
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: 'Press Start 2P', monospace;
  overflow: hidden; 
}

/* 🎮 ANG CONSOLE BORDER (Pinalapad ng konti ang gilid) */
#app-wrapper {
  position: relative;
  /* Top: 40px, Right: 60px, Bottom: 90px, Left: 60px */
  padding: 40px 60px 90px 60px; 
  background: linear-gradient(135deg, #1e7058, #0b3d2e); 
  border-radius: 20px 20px 40px 40px; 
  box-shadow: 
    inset 0 4px 10px rgba(255, 255, 255, 0.2), 
    inset 0 -5px 15px rgba(0, 0, 0, 0.5), 
    0 15px 40px rgba(0, 0, 0, 0.8); 
  border: 2px solid #062118;
}

/* 🔴 POKEBALL DECAL SA TAAS */
.pokeball-decal {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: linear-gradient(to bottom, #e53935 50%, #ffffff 50%);
  border: 2px solid #111;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.4);
}
/* Pokeball center button */
.pokeball-decal::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: #fff;
  border: 2px solid #111;
  border-radius: 50%;
}

/* 🔠 POKEMON TEXT SA UPPER LEFT */
.top-decal-text {
  position: absolute;
  top: 15px;
  left: 60px;
  font-size: 10px;
  color: #FFEA00;
  text-shadow: 1px 1px 0px #3b4cca;
  letter-spacing: 2px;
}

/* 🔊 SPEAKER HOLES SA LOWER LEFT */
.speaker-holes {
  position: absolute;
  bottom: 35px;
  left: 60px;
  display: flex;
  gap: 6px;
}
.speaker-holes span {
  width: 6px;
  height: 24px;
  background: #062118;
  border-radius: 10px;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.8), 0 1px 1px rgba(255,255,255,0.1);
}

/* 🕹️ A & B BUTTONS SA LOWER RIGHT */
.action-buttons {
  position: absolute;
  bottom: 25px;
  right: 100px; /* Ilagay sa tabi ng power light */
  display: flex;
  gap: 12px;
}
.action-buttons .btn {
  width: 32px;
  height: 32px;
  background: #2a2a2a;
  border-radius: 50%;
  border: 2px solid #062118;
  box-shadow: 
    inset 0 2px 4px rgba(255,255,255,0.2), 
    0 4px 6px rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #777;
  font-size: 12px;
  font-family: Arial, sans-serif;
  font-weight: bold;
}
.btn-a {
  transform: translateY(-12px); /* Itaas ng konti ang A button */
}

/* 🟢 POWER LIGHT INDICATOR */
#app-wrapper::before {
  content: '';
  position: absolute;
  bottom: 35px;
  right: 60px;
  width: 14px;
  height: 14px;
  background-color: #42b883; 
  border-radius: 50%;
  box-shadow: 0 0 10px #42b883, inset 0 0 4px rgba(0,0,0,0.8);
  border: 2px solid #0b3d2e;
}

/* 🕹️ VUE BOY ADVANCE LOGO SA ILALIM (Gitna) */
#app-wrapper::after {
  content: 'VUE BOY ADVANCE';
  position: absolute;
  bottom: 35px;
  left: 0;
  width: 100%;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4); 
  letter-spacing: 4px;
  pointer-events: none;
  text-shadow: -1px -1px 0 rgba(0,0,0,0.3), 1px 1px 0 rgba(255,255,255,0.1); 
}

/* 📺 ANG MISMONG SCREEN (800x600) */
#game-container {
  width: 800px;
  height: 600px;
  background-color: #000; 
  border: 6px solid #111; 
  border-radius: 4px;
  box-shadow: inset 0 0 15px rgba(0,0,0,1), 0 0 0 2px #333; 
  overflow: hidden;
  position: relative;
}

/* --- VUE UI LAYER CLASSES --- */
#ui-layer {
  position: absolute;
  /* Updated para sumakto sa bagong padding (40px top, 60px left) */
  top: 40px;
  left: 60px;
  width: 800px;
  height: 600px;
  pointer-events: none; 
}

.name-input-modal {
  pointer-events: auto;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #F8F8F8;
  border: 6px solid #606060;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  box-shadow: inset 0 0 0 4px #D8D8D8, 0 8px 20px rgba(0,0,0,0.5);
}

.modal-content p {
  color: #303030;
  font-size: 16px;
  margin-bottom: 20px;
  line-height: 1.5;
}

input[type="text"] {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  padding: 10px;
  text-align: center;
  text-transform: uppercase;
  border: 2px solid #888;
  border-radius: 4px;
  outline: none;
  width: 180px;
  margin-bottom: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

input[type="text"]:focus {
  border-color: #e53935;
}

button {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 10px 20px;
  background-color: #e53935;
  color: white;
  border: 4px solid #b71c1c;
  cursor: pointer;
}

button:hover {
  background-color: #ff5252;
}
</style>