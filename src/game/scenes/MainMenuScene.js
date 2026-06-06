import Phaser from 'phaser';

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

    // 7. KEYBOARD CONTROLS (Up, Down, Enter)
    this.input.keyboard.on('keydown-UP', () => {
      this.currentIndex = (this.currentIndex > 0) ? this.currentIndex - 1 : this.menuOptions.length - 1;
      this.updateCursor();
    });

    this.input.keyboard.on('keydown-DOWN', () => {
      this.currentIndex = (this.currentIndex < this.menuOptions.length - 1) ? this.currentIndex + 1 : 0;
      this.updateCursor();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      this.selectOption();
    });
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
    const selected = this.menuOptions[this.currentIndex];
    
    // I-disable muna ang keyboard para hindi mag-double enter
    this.input.keyboard.removeAllListeners();

    if (selected === 'NEW GAME') {
      this.cameras.main.fadeOut(800, 0, 0, 0); // Fade to black
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('IntroScene'); // Dito na papasok si Prof Birch!
      });
    } 
    else if (selected === 'CONTINUE') {
      // Kapag pinili ang continue, lalaktawan si Birch at didiretso sa laro
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        alert(`Nilo-load ang file ni ${this.saveData.name}... (Overworld Scene na ito next)`);
        // this.scene.start('OverworldScene');
      });
    }
    else if (selected === 'OPTIONS') {
      alert('Wala pang options menu. Balik!');
      this.scene.restart(); // Temporary restart lang
    }
  }
}