import Phaser from 'phaser';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  preload() {
    // Kapag may image ka na ni Prof Birch, dito mo i-load:
    // this.load.image('birch', '/assets/prof_birch.png');
  }

  create() {
    // 1. FADE IN AT BACKGROUND (Dark Teal)
    this.cameras.main.fadeIn(1000, 255, 255, 255);
    this.cameras.main.setBackgroundColor('#285068'); 

    // 2. PROFESSOR BIRCH SPRITE (Placeholder)
    // Kapag may image na, palitan ng: this.add.image(400, 250, 'birch').setScale(2);
    this.birchSprite = this.add.rectangle(400, 220, 150, 250, 0xE0B888); 
    this.add.text(400, 220, 'BIRCH\nIMAGE', { color: '#000', align: 'center', fontFamily: '"Press Start 2P", monospace' }).setOrigin(0.5);

    // 3. DIALOGUE BOX DESIGN (Classic Rounded Rectangle)
    const boxX = 40;
    const boxY = 420;
    const boxW = 720;
    const boxH = 140;

    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillRoundedRect(boxX, boxY, boxW, boxH, 8);
    
    // Outer border (Blue)
    graphics.lineStyle(6, 0x506888, 1); 
    graphics.strokeRoundedRect(boxX, boxY, boxW, boxH, 8);
    
    // Inner border (Red)
    graphics.lineStyle(2, 0xE06868, 1); 
    graphics.strokeRoundedRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8, 4);

    // 4. DIALOGUE TEXT SETUP
    this.dialogueText = this.add.text(boxX + 30, boxY + 25, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px', // Pinaliit mula 20px
      color: '#303030',
      lineSpacing: 10,  // Binawasan ang gap ng bawat linya
      wordWrap: { width: boxW - 60, useAdvancedWrap: true }
    });

    // 5. ANG MGA SASABIHIN NI BIRCH
    this.dialogues = [
      "Hi! Sorry to keep you waiting!",
      "Welcome to the world of POKÉMON!",
      "My name is BIRCH.",
      "But everyone calls me the POKÉMON PROFESSOR.",
      "This world is widely inhabited by creatures known as POKÉMON.",
      "We humans live alongside POKÉMON, at times as friendly playmates, and at times as cooperative workmates.",
      "To unravel POKÉMON mysteries, I've been undertaking research. That's what I do.",
      "And you are?"
    ];

    this.currentDialogueIndex = 0;
    this.isTyping = false;
    this.typewriterTimer = null;

    // Simulan ang unang line
    this.showNextDialogue();

    // 6. INPUT HANDLING (Click o Enter)
    this.input.keyboard.on('keydown-ENTER', () => this.handleInput());
    this.input.on('pointerdown', () => this.handleInput());
  }

  // --- TYPEWRITER LOGIC ---
  showNextDialogue() {
    // Kapag tapos na ang lahat ng sasabihin, itago ang sprite at ilabas ang Vue Name Input
    if (this.currentDialogueIndex >= this.dialogues.length) {
        this.birchSprite.setVisible(false); // Itago si Birch
        this.dialogueText.setText('');      // Linisin ang text box
        window.dispatchEvent(new CustomEvent('show-name-input'));
        return;
    }

    const fullText = this.dialogues[this.currentDialogueIndex];
    this.dialogueText.setText(''); // I-reset ang text sa blangko
    this.isTyping = true;
    let charIndex = 0;

    // Dito nagaganap ang paisa-isang paglabas ng letra
    this.typewriterTimer = this.time.addEvent({
        delay: 35, // Bilis ng pag-type (mas mababa, mas mabilis)
        repeat: fullText.length - 1,
        callback: () => {
            this.dialogueText.text += fullText[charIndex];
            charIndex++;
            
            // Kapag na-type na ang buong sentence
            if (charIndex === fullText.length) {
                this.isTyping = false;
            }
        }
    });
  }

  handleInput() {
    if (this.isTyping) {
        // FAST FORWARD: Kapag pumindot habang nagta-type, tapusin agad.
        if (this.typewriterTimer) this.typewriterTimer.remove();
        this.dialogueText.setText(this.dialogues[this.currentDialogueIndex]);
        this.isTyping = false;
    } else {
        // NEXT PAGE: Kapag tapos na mag-type, ilipat sa susunod na line.
        this.currentDialogueIndex++;
        this.showNextDialogue();
    }
  }
}