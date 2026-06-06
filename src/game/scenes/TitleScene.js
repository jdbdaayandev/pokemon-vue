import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // 1. GOOD VIBES BACKGROUND (Bright Hoenn Sky Blue)
    this.cameras.main.setBackgroundColor('#68B0E8');

    // 2. FLUFFY CLOUDS (Gumagalaw sa likod)
    // Paggawa ng procedural white cloud gamit ang circles
    const createCloud = (startX, y, scale) => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.85); // White na medyo transparent
      cloud.fillCircle(0, 0, 30);
      cloud.fillCircle(25, -15, 45); // Gitna na mas mataas
      cloud.fillCircle(50, 0, 30);
      cloud.setPosition(startX, y);
      cloud.setScale(scale);
      
      // I-scroll ang ulap papunta sa kanan
      this.tweens.add({
        targets: cloud,
        x: 900,
        duration: 15000 + Math.random() * 10000, // Iba-iba ang bilis
        repeat: -1,
        onRepeat: () => { cloud.x = -150; } // Babalik sa kaliwa pag lampas
      });
    };

    // Maglagay tayo ng tatlong ulap sa iba't ibang pwesto
    createCloud(100, 100, 1);
    createCloud(500, 250, 1.5);
    createCloud(-50, 400, 0.8);

    // 3. POKEMON TEXT
    const pokemonText = this.add.text(400, -100, 'POKEMON', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '64px',
      color: '#FFEA00', // Bright Yellow
      stroke: '#3b4cca',
      strokeThickness: 16,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true },
      padding: { x: 30, y: 30 } 
    }).setOrigin(0.5);

    // 4. VUE VERSION TEXT
    const vueText = this.add.text(400, 260, 'VUE VERSION', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '44px',
      color: '#42b883', // Fresh Vue Green
      stroke: '#ffffff',
      strokeThickness: 10,
      shadow: { offsetX: 0, offsetY: 6, color: '#2c3e50', blur: 0, fill: true },
      padding: { x: 30, y: 30 }
    }).setOrigin(0.5);
    vueText.setScale(0);

    // --- ANIMATIONS ---
    this.tweens.add({
      targets: pokemonText,
      y: 160,
      duration: 1500,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: vueText,
          scale: 1,
          duration: 800,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({
              targets: vueText,
              y: 265,
              duration: 1500,
              yoyo: true,
              repeat: -1,
              ease: 'Sine.easeInOut'
            });
            showStartPrompt();
          }
        });
      }
    });

    // 5. BLINKING "PRESS ENTER"
    const promptText = this.add.text(400, 480, 'PRESS ENTER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      padding: { x: 20, y: 20 }
    }).setOrigin(0.5);
    promptText.setAlpha(0);

    const proceedToIntro = () => {
      // Good vibes transition: Magfe-fade to White bago pumunta kay Prof Birch
      this.cameras.main.fadeOut(800, 255, 255, 255);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    };

    const showStartPrompt = () => {
      this.tweens.add({
        targets: promptText,
        alpha: 1,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Stepped',
        easeParams: [1]
      });

      this.input.keyboard.once('keydown-ENTER', proceedToIntro);
    };

    // 6. COPYRIGHT TEXT
    this.add.text(400, 570, '©2026 JDBD GAMES inc.', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      padding: { x: 10, y: 10 }
    }).setOrigin(0.5);
  }
}