import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    this.load.json('dialogues', '/assets/data/dialogues.json');
  }

  create() {
    const store = useGameStore(); // Kunin ang store sa simula

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

    // 🔴 1. BAGONG CONTROL PHASES
    this.phase = 'pre-name'; // Pwedeng 'pre-name' o 'post-name'
    this.lastInputTime = 0; 
    this.waitingForName = false; 
    this.isTransitioning = false;

    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // Kunin ang unang set ng dialogues sa JSON
    const dialogueData = this.cache.json.get('dialogues');
    this.dialogues = dialogueData.intro_birch; 
    this.currentDialogueIndex = 0;
    this.isTyping = false;
    this.typewriterTimer = null;

    this.showNextDialogue();

    // 🔴 2. ANG PARATING NA SIGNAL MULA SA VUE (Matapos i-OK ang pangalan)
    this.startGameListener = (event) => {
      window.removeEventListener('start-game', this.startGameListener);
      
      // I-unlock ang input at lumipat sa Post-Name phase!
      this.waitingForName = false;
      this.phase = 'post-name';
      this.currentDialogueIndex = 0;

      // I-inject ang totoong pangalan na tinype ng player sa bagong lines
      const name = store.playerName;
      this.dialogues = [
        `Ah, so you're ${name}?`,
        "Your very own adventure is about to unfold.",
        "Take courage, and leap into the world of POKÉMON where dreams, adventure, and friendships await!",
        "I'll be waiting for you. Come see me in my POKÉMON LAB."
      ];

      this.birchSprite.setVisible(true); // Pakitang muli si Birch
      this.showNextDialogue();
    };

    window.addEventListener('start-game', this.startGameListener);
  }

  update() {
    if (this.waitingForName || this.isTransitioning) return;

    const store = useGameStore();
    const pad = this.input.gamepad ? this.input.gamepad.pad1 : null;

    const isKeyboardPressed = 
      Phaser.Input.Keyboard.JustDown(this.enterKey) || 
      Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
      Phaser.Input.Keyboard.JustDown(this.zKey);

    const isUiPressed = store.keys.action || store.keys.start;
    const isGamepadPressed = pad && (pad.A || pad.start);
    const isPointerPressed = this.input.activePointer.justDown;

    if (isKeyboardPressed || ((isUiPressed || isGamepadPressed || isPointerPressed) && this.time.now - this.lastInputTime > 250)) {
      this.lastInputTime = this.time.now;
      
      store.keys.action = false;
      store.keys.start = false;

      this.handleInput();
    }
  }

  showNextDialogue() {
    // 🔴 3. CHECKS KUNG TAPOS NA ANG KASALUKUYANG PHASE
    if (this.currentDialogueIndex >= this.dialogues.length) {
        if (this.phase === 'pre-name') {
            // Tapos na ang Part 1, itago si Birch at tawagin ang Vue Input modal
            this.birchSprite.setVisible(false);
            this.dialogueText.setText('');
            this.waitingForName = true; 
            window.dispatchEvent(new CustomEvent('show-name-input'));
        } else {
            // Tapos na ang Part 2, dyan na mag-fe-fade out tuluyan papuntang Overworld!
            this.isTransitioning = true;
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('OverworldScene');
            });
        }
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