import Phaser from 'phaser';
import { SplashScene } from './scenes/SplashScene';
import { TitleScene } from './scenes/TitleScene';
import { MainMenuScene } from './scenes/MainMenuScene'; // <-- I-import ito
import { IntroScene } from './scenes/IntroScene';

export const gameConfig = {
  type: Phaser.AUTO,
  width: 800, 
  height: 600,
  parent: 'game-container', 
  pixelArt: true,
  audio: {
    noAudio: true 
  },
  // Idagdag ang MainMenuScene bago ang IntroScene
  scene: [SplashScene, TitleScene, MainMenuScene, IntroScene], 
};