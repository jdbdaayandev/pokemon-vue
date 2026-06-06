import Phaser from 'phaser';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    // 1. I-LOAD ANG JSON DATA FILE
    this.load.json('dialogues', '/assets/data/dialogues.json');
  }

  create() {
    this.cameras.main.fadeIn(1000, 255, 255, 255);
    this.cameras.main.setBackgroundColor('#285068'); 

    this.birchSprite = this.add.rectangle(400, 220, 150, 250, 0xE0B888); 

    // Dialogue box geometry
    const boxX = 40;
    const boxY = 420;
    const boxW = 720;
    const boxH = 140;

    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRoundedRect(boxX, boxY, boxW, boxH, 8);
    graphics.lineStyle(6, 0x506888, 1); 
    graphics.strokeRoundedRect(boxX, boxY, boxW, boxH, 8);

    this.dialogueText = this.add.text(boxX + 30, boxY + 25, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#303030',
      lineSpacing: 10,
      wordWrap: { width: boxW - 60, useAdvancedWrap: true }
    });

    // 2. KUNIN ANG DATA MULA SA JSON CACHE
    const dialogueData = this.cache.json.get('dialogues');
    this.dialogues = dialogueData.intro_birch; // Kinuha natin yung "intro_birch" key!

    this.currentDialogueIndex = 0;
    this.isTyping = false;
    this.typewriterTimer = null;

    this.showNextDialogue();

    this.input.keyboard.on('keydown-ENTER', () => this.handleInput());
    this.input.on('pointerdown', () => this.handleInput());
  }

  // --- (Mananatili dito yung dating typewriter at handleInput functions natin) ---
  showNextDialogue() {
    if (this.currentDialogueIndex >= this.dialogues.length) {
        this.birchSprite.setVisible(false);
        this.dialogueText.setText('');
        window.dispatchEvent(new CustomEvent('show-name-input'));
        return;
    }

    const fullText = this.dialogues[this.currentDialogueIndex];
    this.dialogueText.setText('');
    this.isTyping = true;
    let charIndex = 0;

    this.typewriterTimer = this.time.addEvent({
        delay: 35,
        repeat: fullText.length - 1,
        callback: () => {
            this.dialogueText.text += fullText[charIndex];
            charIndex++;
            if (charIndex === fullText.length) {
                this.isTyping = false;
            }
        }
    });
  }

  handleInput() {
    if (this.isTyping) {
        if (this.typewriterTimer) this.typewriterTimer.remove();
        this.dialogueText.setText(this.dialogues[this.currentDialogueIndex]);
        this.isTyping = false;
    } else {
        this.currentDialogueIndex++;
        this.showNextDialogue();
    }
  }
}