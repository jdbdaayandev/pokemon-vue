import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore'; 

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  preload() {
    // Siguraduhing tama ang path kung saan mo sinave yung image!
    this.load.image('title_bg', 'assets/images/title_bg.png'); 
  }

  create() {
    this.canStart = false;
    this.isStarting = false;
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // ==========================================
    // 1. BACKGROUND IMAGE (May kasama nang logo at copyright)
    // ==========================================
    const bg = this.add.image(0, 0, 'title_bg').setOrigin(0, 0);
    bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

    // ==========================================
    // 2. BLINKING "PRESS START"
    // ==========================================
    const promptText = this.add.text(400, 480, 'PRESS START', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      padding: { x: 20, y: 20 }
    }).setOrigin(0.5);
    
    promptText.setAlpha(0); // Nakatago muna sa simula

    this.proceedToIntro = () => {
      if (this.isStarting) return;
      this.isStarting = true; 
      
      // Flash to white pagkapindot ng Start
      this.cameras.main.fadeOut(800, 255, 255, 255);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    };

    const showStartPrompt = () => {
      // Kurap-kurap effect
      this.tweens.add({
        targets: promptText,
        alpha: 1,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Stepped',
        easeParams: [1]
      });
      this.canStart = true;
    };

    // ==========================================
    // 3. DRAMATIC ENTRANCE DELAY
    // ==========================================
    // Maghihintay ng 1 segundo bago lumabas ang "PRESS START" para astig
    this.time.delayedCall(1000, () => {
        showStartPrompt();
    });

    // P.S. Tinanggal ko na rin yung copyright text sa code kasi 
    // nandoon na iyon sa mismong title_bg.png mo!
  }

  update() {
    if (!this.canStart || this.isStarting) return;

    const store = useGameStore();
    const pad = this.input.gamepad ? this.input.gamepad.pad1 : null;

    // Pwedeng pindutin ang Enter, Space, Z, o Start/A Button sa Gamepad
    const isStartPressed = 
      Phaser.Input.Keyboard.JustDown(this.enterKey) || 
      store.keys.start || 
      store.keys.action || 
      (pad && (pad.start || pad.A));

    if (isStartPressed) {
      store.keys.start = false;
      store.keys.action = false;
      
      this.proceedToIntro();
    }
  }
}