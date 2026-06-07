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
  width: 800, 
  height: 600,
  parent: 'game-container', 
  pixelArt: true,
  roundPixels: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
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