import { useGameStore } from '../../stores/gameStore';

export class MomIntroEvent {
  constructor(scene) {
    this.scene = scene; 
    this.store = useGameStore();

    // Kusang makikinig ang Event na ito sa update loop ng buong laro
    this.scene.events.on('update', this.update, this);
  }

  play() {
    this.scene.cutscenePhase = 'spawning';
    this.scene.player.isMoving = true; // 🔒 I-Lock si Brendan

    this.scene.time.delayedCall(1000, () => {
      this.startMomCutscene();
    });
  }

  startMomCutscene() {
    // 1. I-setup si Mom base sa logic natin
    if (!this.scene.momNpc) {
      this.scene.momNpc = this.scene.add.sprite(this.scene.player.x + 100, this.scene.player.y - 50, 'npc_1');
      this.scene.momNpc.setDepth(9998);
      this.scene.momNpc.isMoving = true;
    }

    const tex = this.scene.momNpc.texture.key;
    const dirs = ['down', 'left', 'right', 'up'];
    const frames = [0, 4, 8, 12];
    
    dirs.forEach((dir, i) => {
      const animKey = `${tex}-walk-${dir}`;
      if (!this.scene.anims.exists(animKey)) {
        this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(tex, { start: frames[i], end: frames[i] + 3 }),
          frameRate: 5,
          repeat: -1
        });
      }
    });

    this.momOriginalX = this.scene.momNpc.x;
    this.momOriginalY = this.scene.momNpc.y;

    const targetX = this.scene.player.x;
    const targetY = this.scene.player.y + 16; 

    // 2. Walk Logic (Down -> Left)
    const walkLeft = () => {
      const distX = Math.abs(this.scene.momNpc.x - targetX);
      this.scene.tweens.add({
        targets: this.scene.momNpc,
        x: targetX,
        duration: distX * 15,
        onStart: () => { this.scene.momNpc.play(`${tex}-walk-left`, true); },
        onComplete: () => {
          if (this.scene.momNpc.anims) this.scene.momNpc.anims.stop();
          if (this.scene.momNpc.setFrame) this.scene.momNpc.setFrame(12); // Patalikod!
          
          this.scene.player.faceDirection('down'); 
          this.showMomDialogue();
        }
      });
    };

    const walkDown = () => {
      const distY = Math.abs(this.scene.momNpc.y - targetY);
      this.scene.tweens.add({
        targets: this.scene.momNpc,
        y: targetY,
        duration: distY * 15, 
        onStart: () => { this.scene.momNpc.play(`${tex}-walk-down`, true); },
        onComplete: () => walkLeft() 
      });
    };

    walkDown(); 
  }

  showMomDialogue() {
    // 🔴 3. BASAHIN ANG DIALOGUE MULA SA SCRIPT (events.json)!
    const eventScript = this.scene.cache.json.get('eventData');
    
    if (!eventScript || !eventScript.mom_intro) {
        console.error("⚠️ Hindi mahanap ang 'mom_intro' sa events.json!");
        this.store.showDialogue('MOM', ["..."]);
    } else {
        const dialogueStep = eventScript.mom_intro.find(step => step.action === 'dialogue');
        if (dialogueStep) {
            const formattedDialogue = dialogueStep.text.map(line => 
                line.replace('{playerName}', this.store.playerName)
            );
            this.store.showDialogue(dialogueStep.speaker, formattedDialogue);
        }
    }
    
    this.scene.cutscenePhase = 'talking';
  }

  // 4. UPDATE LOOP NG EVENT (Para pumuwi si Mom)
  update() {
    if (this.scene.cutscenePhase === 'talking' && !this.store.dialogue.isOpen) {
      this.scene.cutscenePhase = 'leaving';
      const tex = this.scene.momNpc.texture.key;

      const returnUp = () => {
        const distY = Math.abs(this.scene.momNpc.y - this.momOriginalY);
        this.scene.tweens.add({
          targets: this.scene.momNpc,
          y: this.momOriginalY,
          duration: distY * 15,
          onStart: () => { this.scene.momNpc.play(`${tex}-walk-up`, true); },
          onComplete: () => {
            this.scene.momNpc.destroy(); 
            this.scene.npcs = this.scene.npcs.filter(npc => npc !== this.scene.momNpc);
            this.scene.cutscenePhase = 'done'; 
            this.scene.player.isMoving = false; // 🔓 I-Unlock na si Brendan!
            
            // 🔴 Patayin ang pakikinig sa update loop para malinis ang memory
            this.scene.events.off('update', this.update, this); 
          }
        });
      };

      const returnRight = () => {
        const distX = Math.abs(this.scene.momNpc.x - this.momOriginalX);
        this.scene.tweens.add({
          targets: this.scene.momNpc,
          x: this.momOriginalX,
          duration: distX * 15,
          onStart: () => { this.scene.momNpc.play(`${tex}-walk-right`, true); },
          onComplete: () => returnUp() 
        });
      };

      returnRight(); 
    }
  }
}