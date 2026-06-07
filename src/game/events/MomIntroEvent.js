import { useGameStore } from '../../stores/gameStore';

export class MomIntroEvent {
  constructor(scene) {
    this.scene = scene;
    this.store = useGameStore();
    this.script = [];
    this.currentStepIndex = 0;
    
    this.scene.events.on('update', this.update, this);
  }

  play() {
    const eventData = this.scene.cache.json.get('eventData');
    if (!eventData || !eventData.mom_intro) {
      console.error("⚠️ Walang 'mom_intro' script sa events.json!");
      return;
    }

    this.script = eventData.mom_intro;

    // Delay ng 1 second bago basahin ang unang linya sa JSON
    this.scene.time.delayedCall(1000, () => {
      this.executeNextStep();
    });
  }

  // 🔴 ITO ANG PUSO NG DIRECTOR: Isa-isang babasahin ang bawat block sa JSON
  // 🔴 ITO ANG PUSO NG DIRECTOR: Isa-isang babasahin ang bawat block sa JSON
  executeNextStep() {
    if (this.currentStepIndex >= this.script.length) {
      // Tapos na ang buong Cutscene!
      this.scene.isIntroDone = true; // 🔴 FLAG: Para hindi na umulit ang cutscene
      this.scene.events.off('update', this.update, this);
      return;
    }

    const step = this.script[this.currentStepIndex];
    this.currentStepIndex++;

    switch (step.action) {
      case 'lock_player':
        this.scene.player.isMoving = true;
        this.executeNextStep(); 
        break;

      case 'unlock_player':
        this.scene.player.isMoving = false;
        this.executeNextStep();
        break;

      case 'spawn_npc':
        this.spawnMom(step);
        this.executeNextStep();
        break;

      case 'walk_down':
      case 'walk_up':
      case 'walk_left':
      case 'walk_right':
        this.handleWalk(step);
        break;

      case 'face_up':
      case 'face_down':
      case 'face_left':
      case 'face_right':
        this.handleFace(step);
        this.executeNextStep();
        break;

      case 'dialogue':
        this.showDialogue(step);
        break;

      case 'destroy':
        if (this.scene.momNpc) {
          this.scene.momNpc.destroy();
          this.scene.npcs = this.scene.npcs.filter(n => n !== this.scene.momNpc);
        }
        this.executeNextStep();
        break;

      default:
        console.warn(`Unknown action: ${step.action}`);
        this.executeNextStep();
        break;
    }
  }

  // ==========================================
  // MGA TIG-IISANG UTOS NG DIREKTOR
  // ==========================================
  
  spawnMom(step) {
    let npc = this.scene.npcs.find(n => n.npcId === step.npcId);
    if (!npc) {
      const spawnX = this.scene.player.x + (step.offsetX || 0);
      const spawnY = this.scene.player.y + (step.offsetY || 0);
      npc = this.scene.add.sprite(spawnX, spawnY, step.texture || 'npc_2');
      npc.setDepth(9998);
      npc.isMoving = true;
      this.scene.momNpc = npc;
    }

    const tex = npc.texture.key;
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
  }

  handleWalk(step) {
    const npc = this.scene.momNpc;
    if (!npc) return this.executeNextStep();

    let targetX = npc.x;
    let targetY = npc.y;
    let animDir = '';

    if (step.action === 'walk_down') { targetY += step.distance; animDir = 'down'; }
    if (step.action === 'walk_up') { targetY -= step.distance; animDir = 'up'; }
    if (step.action === 'walk_left') { targetX -= step.distance; animDir = 'left'; }
    if (step.action === 'walk_right') { targetX += step.distance; animDir = 'right'; }

    const tex = npc.texture.key;

    this.scene.tweens.add({
      targets: npc,
      x: targetX,
      y: targetY,
      duration: step.distance * 15,
      onStart: () => { npc.play(`${tex}-walk-${animDir}`, true); },
      onComplete: () => {
        npc.anims.stop();
        // 🔴 NEXT SCRIPT NA PAGKABAGSAK SA LOKASYON!
        this.executeNextStep();
      }
    });
  }

  handleFace(step) {
    // Para kay Player
    if (step.target === 'player') {
      const dir = step.action.replace('face_', ''); // kukunin ang 'right', 'left', etc.
      this.scene.player.faceDirection(dir);
      return;
    }

    // Para kay Mom
    const npc = this.scene.momNpc;
    if (!npc) return;

    let frame = 0; // down
    if (step.action === 'face_up') frame = 12;
    if (step.action === 'face_left') frame = 4;
    if (step.action === 'face_right') frame = 8;
    
    if (npc.setFrame) npc.setFrame(frame);
  }

  showDialogue(step) {
    const formattedDialogue = step.text.map(line => 
        line.replace('{playerName}', this.store.playerName)
    );
    this.store.showDialogue(step.speaker, formattedDialogue);
    this.scene.cutscenePhase = 'talking';
  }

  update() {
    // 🔴 KAPAG NA-ISARA NA ANG DIALOGUE BOX, ITUTULOY ANG NEXT STEP SA JSON!
    if (this.scene.cutscenePhase === 'talking' && !this.store.dialogue.isOpen) {
      this.scene.cutscenePhase = 'running'; 
      this.executeNextStep();
    }
  }
}