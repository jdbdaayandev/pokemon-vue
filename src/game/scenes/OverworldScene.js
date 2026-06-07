// src/game/scenes/OverworldScene.js
import Phaser from 'phaser';
import { Player } from '../entities/Player'; 
import { NPC } from '../entities/NPC';

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  create() {
    // ==========================================
    // 1. MAP AT LAYERS SETUP MUNA
    // ==========================================
    const map = this.make.tilemap({ key: 'sproutwood_town' });
    const tileset = map.addTilesetImage('exterior_tileset', 'tiles');
    
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const collisionLayer = map.createLayer('Collission', tileset, 0, 0);
    const overheadLayer = map.createLayer('Overhead', tileset, 0, 0);
    
    overheadLayer.setDepth(10); 
    collisionLayer.setVisible(false);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2);

    // ==========================================
    // 2. SPAWN PLAYER
    // ==========================================
    this.player = new Player(this, 168, 168, collisionLayer);

    // ==========================================
    // 3. SPAWN NPCS MULA SA TILED LAYER & JSON
    // ==========================================
    this.npcs = [];
    const npcLayer = map.getObjectLayer('NPCs'); 
    
    const allNpcData = this.cache.json.get('npcData');

    if (npcLayer) {
      npcLayer.objects.forEach(npcObj => {
        const npcId = npcObj.properties?.find(p => p.name === 'npcId')?.value;

        const data = (allNpcData && allNpcData[npcId]) 
            ? allNpcData[npcId] 
            : { texture: 'npc_1', name: 'Unknown', dialogue: ['...'] };

        // --- BAGONG ALIGNMENT FIX DITO ---
        // Pilitin ang X at Y na sumakto sa multiples ng 16 bago i-center (+8)
        const gridX = Math.floor(npcObj.x / 16) * 16 + 8;
        const gridY = Math.floor(npcObj.y / 16) * 16 + 8;

        const npc = new NPC(this, gridX, gridY, data.texture, collisionLayer);
        
        npc.npcId = npcId;
        npc.npcName = data.name;
        npc.dialogue = data.dialogue;

        this.npcs.push(npc);
      });
    }

    // ==========================================
    // 4. CAMERA SETUP
    // ==========================================
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update() {
    this.player.update();
    this.npcs.forEach(npc => npc.update());
  }
}