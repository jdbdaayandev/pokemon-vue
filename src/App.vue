<template>
  <div id="app-wrapper">
    
    <!-- 🎮 MGA CONSOLE DECALS & PALAMUTI -->
    <div class="top-decal-text">POKÉMON</div>
    <div class="pokeball-decal"></div>
    
    <!-- 📺 SCREEN WRAPPER -->
    <div class="screen-wrapper" ref="screenWrapper">
      <div id="game-container"></div>
      <div id="ui-layer" :style="{ transform: `scale(${uiScale})` }">
        <DialogueBox />

        <StartMenu />

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

    <!-- 🔊 SPEAKERS -->
    <div class="speaker-holes">
      <span></span><span></span><span></span><span></span><span></span>
    </div>

    <!-- 🎮 ON-SCREEN D-PAD (Mas mababaw na pindot) -->
    <div class="d-pad">
      <div class="d-btn up" @touchstart.prevent="press('up')" @touchend.prevent="release('up')" @mousedown="press('up')" @mouseup="release('up')" @mouseleave="release('up')"></div>
      <div class="d-btn left" @touchstart.prevent="press('left')" @touchend.prevent="release('left')" @mousedown="press('left')" @mouseup="release('left')" @mouseleave="release('left')"></div>
      <div class="d-center"></div>
      <div class="d-btn right" @touchstart.prevent="press('right')" @touchend.prevent="release('right')" @mousedown="press('right')" @mouseup="release('right')" @mouseleave="release('right')"></div>
      <div class="d-btn down" @touchstart.prevent="press('down')" @touchend.prevent="release('down')" @mousedown="press('down')" @mouseup="release('down')" @mouseleave="release('down')"></div>
    </div>

    <!-- 🎮 SYSTEM BUTTONS: START & SELECT -->
    <div class="system-buttons">
      <div class="sys-btn-wrapper">
        <div class="sys-btn" @touchstart.prevent="press('select')" @touchend.prevent="release('select')" @mousedown="press('select')" @mouseup="release('select')" @mouseleave="release('select')"></div>
        <span>SELECT</span>
      </div>
      <div class="sys-btn-wrapper">
        <div class="sys-btn" @touchstart.prevent="press('start')" @touchend.prevent="release('start')" @mousedown="press('start')" @mouseup="release('start')" @mouseleave="release('start')"></div>
        <span>START</span>
      </div>
    </div>

    <!-- 🎮 CLICKABLE ACTION BUTTONS (Mas mababaw na pindot) -->
    <div class="action-buttons">
      <div class="btn btn-b" @touchstart.prevent="press('cancel')" @touchend.prevent="release('cancel')" @mousedown="press('cancel')" @mouseup="release('cancel')" @mouseleave="release('cancel')">B</div>
      <div class="btn btn-a" @touchstart.prevent="press('action')" @touchend.prevent="release('action')" @mousedown="press('action')" @mouseup="release('action')" @mouseleave="release('action')">A</div>
    </div>

    <div class="controls-guide">
      <div class="guide-title">PC CONTROLS</div>
      <ul>
        <li><span class="key">WASD / ARROWS</span> - MOVE</li>
        <li><span class="key">Z / SPACE</span> - 'A' (INTERACT)</li>
        <li><span class="key">X / ESC</span> - 'B' (CANCEL)</li>
        <li><span class="key">ENTER</span> - START (MENU)</li>
      </ul>
    </div>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import Phaser from 'phaser';
import { gameConfig } from './game/config';
import DialogueBox from './components/DialogueBox.vue';
import { useGameStore } from './stores/gameStore';
import StartMenu from './components/StartMenu.vue';

let gameInstance = null;
const showNameInput = ref(false);
const tempName = ref('');
const store = useGameStore();

const screenWrapper = ref(null);
const uiScale = ref(1); 

const handleResize = () => {
  if (screenWrapper.value) {
    uiScale.value = screenWrapper.value.clientWidth / 800;
  }
};

const press = (key) => {
  store.keys[key] = true;
};

const release = (key) => {
  store.keys[key] = false;
};

const handleNameInputEvent = () => {
  showNameInput.value = true;
};

onMounted(() => {
  gameInstance = new Phaser.Game(gameConfig);
  window.addEventListener('show-name-input', handleNameInputEvent);
  store.loadSaveData();

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50); 
});

onBeforeUnmount(() => {
  if (gameInstance) {
    gameInstance.destroy(true);
  }
  window.removeEventListener('show-name-input', handleNameInputEvent);
  window.removeEventListener('resize', handleResize);
});

const confirmName = () => {
  if (tempName.value.trim() !== '') {
    showNameInput.value = false;
    store.setPlayerName(tempName.value.trim().toUpperCase());
    window.dispatchEvent(new CustomEvent('start-game'));
  }
};
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: #1a1a1a; 
  display: flex; justify-content: center; align-items: center;
  min-height: 100vh;
  font-family: 'Press Start 2P', monospace;
  overflow: hidden; 
}

/* =========================================
   DESKTOP VIEW: GBA (LANDSCAPE)
   ========================================= */
#app-wrapper {
  position: relative;
  padding: 30px 40px 100px 40px; /* 🔴 Bahagyang hinabaan sa PC para sa spacing */
  background: linear-gradient(135deg, #1e7058, #0b3d2e); 
  border-radius: 15px; 
  box-shadow: inset 0 4px 10px rgba(255, 255, 255, 0.2), 0 15px 40px rgba(0, 0, 0, 0.8); 
  border: 2px solid #062118;
  display: flex; flex-direction: column; align-items: center;
  min-width: 320px; 
}

/* 🔴 DECALS */
.pokeball-decal {
  position: absolute; top: 10px; left: 50%; transform: translateX(-50%);
  width: 16px; height: 16px;
  background: linear-gradient(to bottom, #e53935 50%, #ffffff 50%);
  border: 2px solid #111; border-radius: 50%;
}
.pokeball-decal::after {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 4px; height: 4px; background: #fff; border: 2px solid #111; border-radius: 50%;
}

.top-decal-text {
  position: absolute; top: 12px; left: 40px;
  font-size: 10px; color: #FFEA00; letter-spacing: 2px;
}

.speaker-holes { position: absolute; bottom: 30px; left: 40px; display: flex; gap: 6px; }
.speaker-holes span {
  width: 6px; height: 20px; background: #062118; border-radius: 10px;
}

/* =========================================
   🎮 D-PAD STYLES (Mas Mababaw na Pindot)
   ========================================= */
.d-pad {
  position: absolute;
  bottom: 40px; 
  left: 40px;
  display: none; 
  grid-template-areas:
    ". up ."
    "left center right"
    ". down .";
  gap: 0;
  user-select: none; 
  -webkit-touch-callout: none;
  z-index: 50;
  filter: drop-shadow(0px 6px 4px rgba(0,0,0,0.6));
}

.d-btn {
  width: 40px; 
  height: 40px; 
  background: linear-gradient(145deg, #3a3a3a, #222222);
  border: 1px solid #111;
  cursor: pointer;
  display: flex; justify-content: center; align-items: center;
  color: #111; font-size: 16px;
}

.d-btn.up::after { content: '▲'; text-shadow: 0 1px 1px rgba(255,255,255,0.1); }
.d-btn.down::after { content: '▼'; text-shadow: 0 1px 1px rgba(255,255,255,0.1); }
.d-btn.left::after { content: '◀'; text-shadow: 0 1px 1px rgba(255,255,255,0.1); }
.d-btn.right::after { content: '▶'; text-shadow: 0 1px 1px rgba(255,255,255,0.1); }

.d-btn.up { grid-area: up; border-radius: 8px 8px 0 0; }
.d-btn.down { grid-area: down; border-radius: 0 0 8px 8px; }
.d-btn.left { grid-area: left; border-radius: 8px 0 0 8px; }
.d-btn.right { grid-area: right; border-radius: 0 8px 8px 0; }

.d-center { 
  grid-area: center; background: #2a2a2a; position: relative; border: none;
}
.d-center::after {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 16px; height: 16px; background: linear-gradient(145deg, #1f1f1f, #2a2a2a);
  border-radius: 50%; box-shadow: inset 0 2px 3px rgba(0,0,0,0.8);
}

.d-btn:active {
  background: #1a1a1a;
  box-shadow: inset 0 2px 3px rgba(0,0,0,0.8); /* 🔴 Mas mababaw na uka */
  color: #000;
}

/* =========================================
   🔴 SYSTEM BUTTONS (Start & Select)
   ========================================= */
.system-buttons {
  position: absolute;
  bottom: 25px;
  left: 50%;
  transform: translateX(-50%);
  display: none; /* Itago by default sa Desktop */
  gap: 20px;
  z-index: 50;
}

.sys-btn-wrapper {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}

.sys-btn {
  width: 40px; height: 12px;
  background: linear-gradient(145deg, #333, #111);
  border-radius: 10px;
  border: 1px solid #000;
  cursor: pointer;
  box-shadow: 0 3px 0 #000, 0 4px 4px rgba(0,0,0,0.5);
  transform: rotate(-15deg); /* Slanted style */
}

.sys-btn:active {
  transform: rotate(-15deg) translateY(2px); /* Mababaw na pindot */
  box-shadow: 0 1px 0 #000, 0 2px 2px rgba(0,0,0,0.5), inset 0 2px 3px rgba(0,0,0,0.8);
}

.sys-btn-wrapper span {
  color: #FFEA00; font-size: 8px; font-family: 'Press Start 2P', monospace;
  letter-spacing: 1px; text-shadow: 1px 1px 0 rgba(0,0,0,0.5);
}

/* =========================================
   🔴 ACTION BUTTONS (Mas Mababaw na Pindot)
   ========================================= */
.action-buttons { 
  position: absolute; bottom: 25px; right: 40px; display: flex; gap: 18px; z-index: 50; 
}

.action-buttons .btn {
  width: 46px; height: 46px; 
  background: linear-gradient(145deg, #d32f2f, #9a0000); 
  border-radius: 50%; border: 2px solid #4a0d0d; 
  color: #ffcccc; font-size: 14px; font-family: 'Press Start 2P', monospace; 
  display: flex; justify-content: center; align-items: center; cursor: pointer; user-select: none;
  box-shadow: 0 6px 0 #5e1111, 0 10px 12px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.4);
  transition: transform 0.1s, box-shadow 0.1s;
}

.btn-a { transform: translateY(-12px); }

/* 🔴 Sinking effect ginawang 3px imbes na 6px para saktong click feel lang */
.action-buttons .btn:active {
  transform: translateY(3px); 
  box-shadow: 0 3px 0 #5e1111, 0 2px 4px rgba(0,0,0,0.6), inset 0 3px 4px rgba(0,0,0,0.6);
  background: #a81f1f; color: #e6a8a8;
}

.action-buttons .btn-a:active {
  transform: translateY(-9px); /* -12px orig minus 3px travel */
}

/* =========================================
   📺 SCREEN WRAPPER
   ========================================= */
.screen-wrapper {
  position: relative; width: 100%; max-width: 800px; aspect-ratio: 4 / 3; 
  background-color: #000; border: 25px solid #222; border-radius: 10px 10px 40px 10px; 
  box-shadow: inset 0 0 15px rgba(0,0,0,1), 0 0 0 2px #333; overflow: hidden; margin-top: 10px;
}

#game-container { width: 100%; height: 100%; }
#game-container canvas { width: 100% !important; height: 100% !important; object-fit: contain; }

#ui-layer {
  position: absolute; top: 0; left: 0; width: 800px; height: 600px;
  transform-origin: top left; pointer-events: none; 
}

/* Modals */
.name-input-modal {
  pointer-events: auto; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6);
  display: flex; justify-content: center; align-items: center;
}
.modal-content {
  background-color: #F8F8F8; border: 6px solid #606060; border-radius: 8px; padding: 20px;
  box-shadow: inset 0 0 0 4px #D8D8D8, 0 8px 20px rgba(0,0,0,0.5); width: 80%; text-align: center;
}
.modal-content p { color: #303030; font-size: 14px; margin-bottom: 20px; }
input[type="text"] {
  font-family: 'Press Start 2P', monospace; font-size: 16px; padding: 10px; text-align: center;
  text-transform: uppercase; border: 2px solid #888; width: 100%; max-width: 180px; margin: 0 auto 15px auto; display: block;
}
button {
  font-family: 'Press Start 2P', monospace; font-size: 12px; padding: 10px 20px;
  background-color: #e53935; color: white; border: 4px solid #b71c1c; cursor: pointer; pointer-events: auto;
}

/* =========================================
   📱 MOBILE VIEW: CLASSIC GB (PORTRAIT)
   ========================================= */
@media (max-width: 850px) {
  body { padding: 10px; align-items: flex-start; }

  #app-wrapper {
    width: 100%;
    max-width: 450px;
    padding: 15px 15px 230px 15px; /* 🔴 Hinabaan ang ilalim (was 180px, naging 230px) */
    border-radius: 10px 10px 60px 10px; 
  }

  .screen-wrapper {
    border-width: 15px; border-radius: 5px 5px 30px 5px;
  }

  /* Ipakita ang D-Pad, System Buttons, at i-adjust ang pwesto */
  .d-pad { display: grid; bottom: 85px; left: 25px; }
  .system-buttons { display: flex; bottom: 30px; } /* Ipakita ang Start/Select */

  .action-buttons {
    bottom: 95px; right: 25px; transform: rotate(-25deg); 
  }

  .speaker-holes { display: none; }
}
/* =========================================
   ⌨️ PC CONTROLS GUIDE (Floating Box)
   ========================================= */
/* =========================================
   ⌨️ PC CONTROLS GUIDE (Console Print Style)
   ========================================= */
.controls-guide {
  position: absolute;
  bottom: 25px; /* Pantay sa speakers at buttons */
  left: 50%;
  transform: translateX(-50%); /* Igitna nang sakto */
  color: rgba(255, 255, 255, 0.4); /* Faded text para mukhang print sa plastic */
  font-family: 'Press Start 2P', monospace;
  text-align: center;
  pointer-events: none; /* Para hindi ma-click */
  z-index: 10;
}

.guide-title {
  color: rgba(255, 234, 0, 0.6); /* Faded Yellow */
  font-size: 8px;
  margin-bottom: 8px;
  letter-spacing: 2px;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}

.controls-guide ul {
  list-style: none;
  display: flex; /* Gawing horizontal ang listahan */
  gap: 20px; /* Espasyo sa pagitan ng bawat instruction */
  margin: 0;
  padding: 0;
}

.controls-guide li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 8px;
  text-shadow: 1px 1px 0 rgba(0,0,0,0.3);
}

.controls-guide .key {
  color: rgba(66, 184, 131, 0.8); /* Faded Vue Green */
  border: 1px solid rgba(66, 184, 131, 0.4);
  padding: 3px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.15); /* Bahagyang nakalubog na background */
  font-size: 8px;
}

/* 🔴 ITAGO SA MOBILE DAHIL MAY TOUCH BUTTONS NA SILA */
@media (max-width: 850px) {
  .controls-guide {
    display: none;
  }
}
</style>