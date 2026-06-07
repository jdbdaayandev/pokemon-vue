import Phaser from 'phaser';
// 🔴 BAGONG CODE: I-import ang store para mabasa ang on-screen buttons
import { useGameStore } from '../../stores/gameStore'; 

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // 🔴 BAGONG CODE: Setup variables para sa universal controls
    this.canStart = false;
    this.isStarting = false;
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // 1. GOOD VIBES BACKGROUND (Bright Hoenn Sky Blue)
    this.cameras.main.setBackgroundColor('#68B0E8');

    // 2. FLUFFY CLOUDS (Gumagalaw sa likod)
    const createCloud = (startX, y, scale) => {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.85);
      cloud.fillCircle(0, 0, 30);
      cloud.fillCircle(25, -15, 45); 
      cloud.fillCircle(50, 0, 30);
      cloud.setPosition(startX, y);
      cloud.setScale(scale);
      
      this.tweens.add({
        targets: cloud,
        x: 900,
        duration: 15000 + Math.random() * 10000, 
        repeat: -1,
        onRepeat: () => { cloud.x = -150; } 
      });
    };

    createCloud(100, 100, 1);
    createCloud(500, 250, 1.5);
    createCloud(-50, 400, 0.8);

    // 3. POKEMON TEXT
    const pokemonText = this.add.text(400, -100, 'POKEMON', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '64px',
      color: '#FFEA00', 
      stroke: '#3b4cca',
      strokeThickness: 16,
      shadow: { offsetX: 4, offsetY: 4, color: '#000000', blur: 0, fill: true },
      padding: { x: 30, y: 30 } 
    }).setOrigin(0.5);

    // 4. VUE VERSION TEXT
    const vueText = this.add.text(400, 260, 'VUE VERSION', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '44px',
      color: '#42b883', 
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

    // Ginawa nating class method para matawag sa update()
    this.proceedToIntro = () => {
      if (this.isStarting) return;
      this.isStarting = true; // Para hindi umulit kapag nai-spam ang pindot
      
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

      // 🔴 BINAGO: Imbes na keyboard lang, i-a-activate natin ang universal flag
      this.canStart = true;
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

  // 🔴 BAGONG CODE: Dito natin babasahin ang lahat ng uri ng controller!
  update() {
    // Kung hindi pa tapos yung animation o kaya nagta-transition na, wag muna bumasa ng input
    if (!this.canStart || this.isStarting) return;

    const store = useGameStore();
    const pad = this.input.gamepad ? this.input.gamepad.pad1 : null; // Basahin ang USB Controller kung meron

    // UNIVERSAL INPUT: Keyboard ENTER || Keyboard Space || UI Start || UI 'A' || Gamepad Start || Gamepad 'A'
    const isStartPressed = 
      Phaser.Input.Keyboard.JustDown(this.enterKey) || 
      store.keys.start || 
      store.keys.action || 
      (pad && (pad.start || pad.A));

    if (isStartPressed) {
      // I-reset ang mga keys sa Pinia para hindi mag-trigger sa susunod na scene
      store.keys.start = false;
      store.keys.action = false;
      
      this.proceedToIntro();
    }
  }
}