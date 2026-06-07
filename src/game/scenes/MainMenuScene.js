import Phaser from 'phaser';
// 🔴 1. IMPORT ANG STORE PARA MABASA ANG UI BUTTONS
import { useGameStore } from '../../stores/gameStore'; 

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    // Fade in mula sa Title Screen
    this.cameras.main.fadeIn(800, 255, 255, 255);
    this.cameras.main.setBackgroundColor('#207868'); // Classic Emerald Teal background

    // 1. CHECK NATIN KUNG MAY SAVE FILE (Parang Memory Card)
    const savedString = localStorage.getItem('vue_emerald_save');
    this.saveData = savedString ? JSON.parse(savedString) : null;

    // 2. I-SETUP ANG MGA MENU OPTIONS
    this.menuOptions = [];
    if (this.saveData) {
      this.menuOptions.push('CONTINUE');
    }
    this.menuOptions.push('NEW GAME');
    this.menuOptions.push('OPTIONS');

    this.currentIndex = 0; // Kung saan nakaturo ang cursor
    
    // 🔴 2. SETUP VARIABLES PARA SA UNIVERSAL CONTROLS
    this.lastMenuTime = 0; 
    this.isSelecting = false; // Lock para iwas double-click
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // 3. I-DRAW ANG MENU BOX
    const menuBox = this.add.graphics();
    menuBox.fillStyle(0xF8F8F8, 1);
    menuBox.fillRoundedRect(50, 50, 300, 200, 10);
    menuBox.lineStyle(6, 0x42b883, 1); // Vue Green border
    menuBox.strokeRoundedRect(50, 50, 300, 200, 10);

    // 4. I-DRAW ANG TEXT NG OPTIONS
    this.optionTexts = [];
    this.menuOptions.forEach((option, index) => {
      const text = this.add.text(120, 80 + (index * 50), option, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#303030'
      });
      this.optionTexts.push(text);
    });

    // 5. I-DRAW ANG CURSOR (Pulang palaso)
    this.cursor = this.add.text(80, 80, '▶', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#e53935' // Red cursor
    });

    // 6. I-DRAW ANG SAVE DETAILS BOX (Lilitaw lang kung nasa "CONTINUE")
    this.detailsGroup = this.add.group();
    if (this.saveData) {
      const detailsBox = this.add.graphics();
      detailsBox.fillStyle(0x3b4cca, 1); // Pokemon Blue background
      detailsBox.fillRoundedRect(400, 50, 350, 200, 10);
      detailsBox.lineStyle(6, 0xffffff, 1);
      detailsBox.strokeRoundedRect(400, 50, 350, 200, 10);

      const titleText = this.add.text(420, 70, 'SAVE DATA', { fontFamily: '"Press Start 2P", monospace', fontSize: '18px', color: '#FFEA00' });
      const nameText = this.add.text(420, 110, `PLAYER: ${this.saveData.name}`, { fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#ffffff' });
      const badgesText = this.add.text(420, 150, `BADGES: ${this.saveData.badges}`, { fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#ffffff' });
      const timeText = this.add.text(420, 190, `TIME:   ${this.saveData.playTime}`, { fontFamily: '"Press Start 2P", monospace', fontSize: '16px', color: '#ffffff' });

      this.detailsGroup.addMultiple([detailsBox, titleText, nameText, badgesText, timeText]);
      this.updateDetailsVisibility(); // Itago kung hindi nakatutok sa "CONTINUE"
    }
  }

  // 🔴 3. DITO BABASAHIN ANG LAHAT NG URI NG CONTROLS
  update() {
    if (this.isSelecting) return; // Wag na bumasa ng inputs kung nakapili na

    const store = useGameStore();
    const pad = this.input.gamepad ? this.input.gamepad.pad1 : null;

    const isUpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) || store.keys.up || (pad && (pad.up || pad.leftStick.y < -0.5));
    const isDownPressed = Phaser.Input.Keyboard.JustDown(this.cursors.down) || store.keys.down || (pad && (pad.down || pad.leftStick.y > 0.5));
    const isActionPressed = 
      Phaser.Input.Keyboard.JustDown(this.enterKey) || 
      Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
      Phaser.Input.Keyboard.JustDown(this.zKey) || 
      store.keys.action || 
      store.keys.start || 
      (pad && (pad.A || pad.start));

    // Delay para hindi mag-hyper scroll
    if (this.time.now - this.lastMenuTime > 150) {
      if (isUpPressed) {
        this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.menuOptions.length - 1;
        this.updateCursor();
        
        store.keys.up = false; // Reset UI
        this.lastMenuTime = this.time.now;
      } 
      else if (isDownPressed) {
        this.currentIndex = (this.currentIndex < this.menuOptions.length - 1) ? this.currentIndex + 1 : 0;
        this.updateCursor();
        
        store.keys.down = false; // Reset UI
        this.lastMenuTime = this.time.now;
      } 
      else if (isActionPressed) {
        store.keys.action = false;
        store.keys.start = false;
        this.lastMenuTime = this.time.now;
        
        this.selectOption();
      }
    }
  }

  // --- HELPER FUNCTIONS ---

  updateCursor() {
    // Igalaw ang cursor sa tamang Y position
    this.cursor.setY(80 + (this.currentIndex * 50));
    this.updateDetailsVisibility();
  }

  updateDetailsVisibility() {
    if (!this.saveData) return;
    // Ipakita lang ang blue box kung ang napili ay "CONTINUE"
    const isContinueSelected = this.menuOptions[this.currentIndex] === 'CONTINUE';
    this.detailsGroup.setVisible(isContinueSelected);
  }

  selectOption() {
    this.isSelecting = true; // 🔴 I-lock ang menu para di ma-double click
    const selected = this.menuOptions[this.currentIndex];

    if (selected === 'NEW GAME') {
      this.cameras.main.fadeOut(800, 0, 0, 0); // Fade to black
      this.cameras.main.once('camerafadeoutcomplete', () => {
        
        // 🔴 KUNG GUSTO MONG LUMABAS ULI YUNG VUE NAME INPUT:
        // window.dispatchEvent(new CustomEvent('show-name-input'));
        // window.addEventListener('start-game', () => { this.scene.start('IntroScene'); }, { once: true });
        
        // OR KUNG DIRETSO INTRO SCENE LANG:
        this.scene.start('IntroScene'); 
      });
    } 
    else if (selected === 'CONTINUE') {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        alert(`Nilo-load ang file ni ${this.saveData.name}... (Overworld Scene na ito next)`);
        // this.scene.start('OverworldScene');
      });
    }
    else if (selected === 'OPTIONS') {
      alert('Wala pang options menu. Balik!');
      this.isSelecting = false; // I-unlock ulit kung babalik lang pala
    }
  }
}