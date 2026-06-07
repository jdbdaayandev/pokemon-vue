import Phaser from 'phaser';

// Kailangan ang 'export class BootScene' para gumana ang import { BootScene }
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Pwedeng walang laman muna ito
  }

  create() {
    // Diretso agad sa PreloadScene pagkabukas
    this.scene.start('PreloadScene');
  }
}