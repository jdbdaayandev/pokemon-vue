import Phaser from 'phaser';

// Siguraduhing tama ang mga spelling ng file paths!
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { SplashScene } from './scenes/SplashScene';
import { TitleScene } from './scenes/TitleScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { IntroScene } from './scenes/IntroScene';
import { OverworldScene } from './scenes/OverworldScene';
import { Route1Scene } from './scenes/Route1Scene'; // 🔴 1. IDINAGDAG ANG IMPORT NG BAGONG MAPA

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container', 
  pixelArt: true,
  roundPixels: false,
  
  // 🔴 Dito dapat nakalagay ang width, height, at FIT mode!
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600
  },

  // (Nilinis ko ito, tinanggal ko yung duplicate block)
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

  audio: { noAudio: true },
  
  // LAHAT SILA DAPAT NANDITO
  scene: [
    BootScene, 
    PreloadScene, 
    SplashScene, 
    TitleScene, 
    MainMenuScene, 
    IntroScene, 
    OverworldScene,
    Route1Scene // 🔴 2. IDINAGDAG SA ARRAY NG SCENES
  ], 
};