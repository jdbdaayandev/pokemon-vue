import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { useGameStore } from '../../stores/gameStore';
import { MomIntroEvent } from '../events/MomIntroEvent'; // 🔴 I-IMPORT ANG BAGONG EVENT MO

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  preload() {
    // 🔴 SIGURADUHING NAKA-LOAD ANG SCRIPT MO
    this.load.json('eventData', 'assets/data/events.json');
  }

  create() {
    const store = useGameStore();

    // 1. MAP AT LAYERS SETUP
    const map = this.make.tilemap({ key: 'sproutwood_town' });
    const tileset = map.addTilesetImage('exterior_tileset', 'tiles');
    
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const collisionLayer = map.createLayer('Collission', tileset, 0, 0);
    const overheadLayer = map.createLayer('Overhead', tileset, 0, 0);
    
    overheadLayer.setDepth(9999); 
    collisionLayer.setVisible(false);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2);

    // 2. SPAWN PLAYER
    this.player = new Player(this, 168, 168, collisionLayer);

    // 3. SPAWN NPCS
    this.npcs = [];
    const npcLayer = map.getObjectLayer('NPCs'); 
    const allNpcData = this.cache.json.get('npcData');

    if (npcLayer) {
      npcLayer.objects.forEach(npcObj => {
        let rawId = npcObj.name || ''; 
        if (npcObj.properties) {
            if (Array.isArray(npcObj.properties)) {
                const prop = npcObj.properties.find(p => p.name === 'npcId' || p.name === 'texture');
                if (prop) rawId = prop.value;
            } else {
                rawId = npcObj.properties.npcId || npcObj.properties.texture || rawId;
            }
        }

        const npcId = rawId ? rawId.toLowerCase() : 'unknown';
        const data = (allNpcData && allNpcData[npcId]) ? allNpcData[npcId] : { texture: 'npc_1', name: 'NPC', dialogue: ['...'] };

        let finalTexture = data.texture;
        if (!this.textures.exists(finalTexture)) finalTexture = 'npc_1'; 

        const gridX = Math.floor(npcObj.x / 16) * 16 + 8;
        const gridY = Math.floor(npcObj.y / 16) * 16 + 8;
        
        const npc = new NPC(this, gridX, gridY, finalTexture, collisionLayer);
        npc.npcId = npcId;
        npc.npcName = data.name;
        npc.dialogue = data.dialogue;

        if (npcId === 'mom') {
            npc.isMoving = true; 
            this.momNpc = npc; 
        }

        this.npcs.push(npc);
      });
    }

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // 🔴 4. TAWAGIN ANG DIREKTOR PARA SA CUTSCENE!
    const momCutscene = new MomIntroEvent(this);
    momCutscene.play();
  }

  update() {
    // 🔴 ANG SIMPLE NA NG UPDATE LOOP MO! Player at NPC na lang!
    if (this.player) {
        this.player.update();
        this.player.setDepth(this.player.y);
    }

    if (this.npcs) {
        this.npcs.forEach(npc => {
            if (npc !== this.momNpc && typeof npc.update === 'function') {
                npc.update();
            }
        });
    }
  }
}