import Phaser from 'phaser';

// Siguraduhing tama ang mga spelling ng file paths!
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SplashScene } from './scenes/SplashScene';
import { TitleScene } from './scenes/TitleScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { IntroScene } from './scenes/IntroScene';
import { OverworldScene } from './scenes/OverworldScene';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container', 
  pixelArt: true,
  roundPixels: false,
  
  // 🔴 BAGONG CODE: Dito dapat nakalagay ang width, height, at FIT mode!
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  
  input: {
    gamepad: true 
  },

  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  audio: { noAudio: true },
  
  // LAHAT SILA DAPAT NANDITO (Ang BootScene ang una)
  scene: [
    BootScene, 
    PreloadScene, 
    SplashScene, 
    TitleScene, 
    MainMenuScene, 
    IntroScene, 
    OverworldScene
  ], 
};