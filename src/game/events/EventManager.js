// src/game/events/EventManager.js
import { useGameStore } from '../../stores/gameStore';

export class EventManager {
  constructor(scene) {
    this.scene = scene;
    this.store = useGameStore();
    this.script = [];
    this.currentStepIndex = 0;
    this.actors = {}; // 🌟 BAGO: Dito natatago lahat ng NPC na kasali sa cutscene gamit ang npcId nila
    
    this.scene.events.on('update', this.update, this);
  }

  // 🌟 BAGO: Tatalunin natin ang eventKey (hal. 'mom_intro', 'rescue_birch', 'rival_battle')
  play(eventKey) {
    const eventData = this.scene.cache.json.get('eventData');
    if (!eventData || !eventData[eventKey]) {
      console.error(`⚠️ Walang script para sa '${eventKey}' sa events.json!`);
      return;
    }

    this.script = eventData[eventKey];
    this.currentStepIndex = 0; // I-reset sa umpisa

    // Delay ng 1 second bago mag-start ang cutscene
    this.scene.time.delayedCall(1000, () => {
      this.executeNextStep();
    });
  }

  executeNextStep() {
    if (this.currentStepIndex >= this.script.length) {
      // Tapos na ang buong Cutscene!
      this.scene.isIntroDone = true; 
      this.scene.events.off('update', this.update, this);
      
      // I-clear ang mga actors para sa susunod na event
      this.actors = {};
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
        this.spawnActor(step); // 🌟 GINAWANG GENERIC
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
        // 🌟 GINAWANG GENERIC: Pwedeng mag-delete ng kahit anong tinukoy na npcId
        if (step.npcId && this.actors[step.npcId]) {
          this.actors[step.npcId].destroy();
          delete this.actors[step.npcId];
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
  // UNIVERSAL UTILS (WALA NANG HARDCODED NA MOM)
  // ==========================================
  
  spawnActor(step) {
    // I-check kung naka-register na sa actors ng cutscene
    let npc = this.actors[step.npcId];
    
    if (!npc) {
      // 🌟 ANG MAGIC TRICK: I-check kung na-spawn na ito ng Scene mula sa Tiled map!
      const existingSceneNpc = this.scene.npcs?.find(n => n.npcId === step.npcId);
      
      if (existingSceneNpc) {
        // Kung nandoon na sa map, ito na ang gagamitin ng direktor!
        npc = existingSceneNpc;
      } else {
        // Kung wala talaga sa map, tsaka lang tayo gagawa ng panibagong sprite
        const spawnX = this.scene.player.x + (step.offsetX || 0);
        const spawnY = this.scene.player.y + (step.offsetY || 0);
        
        npc = this.scene.add.sprite(spawnX, spawnY, step.texture || 'npc_2');
        npc.setDepth(9998);
        npc.isMoving = true;
      }
      
      // I-save sa listahan ng mga gumagalaw sa cutscene
      this.actors[step.npcId] = npc;
    }

    // (Yung natitirang code pababa para sa pag-setup ng anims ay pareho pa rin...)
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
    // Hanapin kung sinong NPC ID ang uutusang maglakad mula sa JSON step mo
    const npc = this.actors[step.npcId];
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
        this.executeNextStep();
      }
    });
  }

  handleFace(step) {
    if (step.target === 'player') {
      const dir = step.action.replace('face_', '');
      this.scene.player.faceDirection(dir);
      return;
    }

    // Utusan ang specific NPC na lumingon
    const npc = this.actors[step.npcId];
    if (!npc) return;

    let frame = 0;
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
    if (this.scene.cutscenePhase === 'talking' && !this.store.dialogue.isOpen) {
      this.scene.cutscenePhase = 'running'; 
      this.executeNextStep();
    }
  }
}