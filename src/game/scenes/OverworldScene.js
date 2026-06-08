import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';
import { useGameStore } from '../../stores/gameStore';
import { EventManager } from '../events/EventManager.js'; // 🌟 BAGO: Pinalitan ang MomIntroEvent ng Universal Manager

export class OverworldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldScene' });
  }

  init(data) {
    this.startPosition = {
      x: data.x !== undefined ? data.x : 280, 
      y: data.y !== undefined ? data.y : 200  
    };
    this.isIntroDone = data.isIntroDone || false;
    this.isTransitioning = false; 

    // 🔴 SALUHIN ANG DIRECTION MULA SA ROUTE 1 (O kaya default to 'down')
    this.startDirection = data.direction || 'down';
  }

  preload() {
    this.load.json('eventData', 'assets/data/events.json');
    this.load.tilemapTiledJSON('route_1', 'assets/data/maps/overworld/route_1.json'); 
  }

  create() {
    const store = useGameStore();

    // 🌟 BAGO: I-initialize ang Universal Event Manager
    this.eventManager = new EventManager(this);

    // 1. MAP SETUP
    const map = this.make.tilemap({ key: 'sproutwood_town' });
    const tileset = map.addTilesetImage('exterior_tileset', 'tiles');
    
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const collisionLayer = map.createLayer('Collission', tileset, 0, 0);
    const overheadLayer = map.createLayer('Overhead', tileset, 0, 0);
    
    overheadLayer.setDepth(9999); 
    collisionLayer.setVisible(false);

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2);

    // ==========================================
    // 🔴 2. UNIVERSAL GRID SNAPPER & SPAWN PLAYER
    // ==========================================
    const perfectX = Math.floor(this.startPosition.x / 16) * 16 + 8;
    const perfectY = Math.floor(this.startPosition.y / 16) * 16 + 8;

    this.player = new Player(this, perfectX, perfectY, collisionLayer, groundLayer);

    // 🔴 I-SET ANG HARAP NI PLAYER DEPENDE SA KUNG SAAN SIYA GALING
    if (this.player.faceDirection) {
        this.player.faceDirection(this.startDirection);
    }
    // ==========================================

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
        
        // 🔴 GHOSTBUSTER: Wag nang i-spawn si Mom kung tapos na ang intro!
        if (npcId === 'mom' && this.isIntroDone) {
            return; 
        }
        
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

    // 4. BASAHIN ANG PORTALS LAYER
    this.portals = [];
    const portalLayer = map.getObjectLayer('Portals'); 

    if (portalLayer) {
        portalLayer.objects.forEach(obj => {
            let tScene, tX, tY;
            if (obj.properties) {
                const props = Array.isArray(obj.properties) ? obj.properties : [];
                tScene = props.find(p => p.name === 'targetScene')?.value || obj.properties.targetScene;
                tX = props.find(p => p.name === 'targetX')?.value || obj.properties.targetX;
                tY = props.find(p => p.name === 'targetY')?.value || obj.properties.targetY;
            }

            this.portals.push({
                x: obj.x, y: obj.y, width: obj.width, height: obj.height,
                targetScene: tScene, targetX: tX, targetY: tY
            });
        });
    }

    // ==========================================
    // 🌟 BAGO: 5. BASAHIN ANG TRIGGERS LAYER MULA SA TILED
    // ==========================================
    this.triggers = [];
    const triggerLayer = map.getObjectLayer('Triggers'); 

    if (triggerLayer) {
        triggerLayer.objects.forEach(obj => {
            let eName, reqStage;
            if (obj.properties) {
                const props = Array.isArray(obj.properties) ? obj.properties : [];
                eName = props.find(p => p.name === 'eventName')?.value || obj.properties.eventName;
                reqStage = props.find(p => p.name === 'requiredStage')?.value || obj.properties.requiredStage;
            }

            this.triggers.push({
                x: obj.x, y: obj.y, width: obj.width, height: obj.height,
                eventName: eName, 
                requiredStage: reqStage !== undefined ? parseInt(reqStage) : 0, 
                activated: false
            });
        });
    }

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.fadeIn(1000, 0, 0, 0);

    // 6. SMART CUTSCENE TRIGGER
    if (!this.isIntroDone) {
        // Gagamitin na natin ang lagayan ng global keys mula sa events.json mo!
        this.eventManager.play('mom_intro');
    }
  }

  update() {
    if (this.isTransitioning) return; 
    const store = useGameStore();

    if (this.player) {
        this.player.update();
        this.player.setDepth(this.player.y);

        // 7. PORTAL COLLISION CHECKER
        if (this.portals) {
            this.portals.forEach(portal => {
                if (this.player.x >= portal.x && this.player.x <= portal.x + portal.width &&
                    this.player.y >= portal.y && this.player.y <= portal.y + portal.height) {
                    
                    this.isTransitioning = true;
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start(portal.targetScene, {
                            x: portal.targetX,
                            y: portal.targetY,
                            isIntroDone: this.isIntroDone,
                            direction: 'up' 
                        });
                    });
                }
            });
        }

        // ==========================================
        // 🌟 BAGO: 8. UNIVERSAL EVENT TRIGGER CHECKER
        // Titingnan niya kung pumasok si player sa event zone at kung tugma sa storyStage
        // ==========================================
        if (this.triggers) {
            this.triggers.forEach(trigger => {
                if (!trigger.activated && store.storyStage === trigger.requiredStage) {
                    if (this.player.x >= trigger.x && this.player.x <= trigger.x + trigger.width &&
                        this.player.y >= trigger.y && this.player.y <= trigger.y + trigger.height) {
                        
                        trigger.activated = true; // Pigilan ang paulit-ulit na pagsabog ng event
                        this.eventManager.play(trigger.eventName); // Patakbuhin ang nakasulat sa Tiled!
                    }
                }
            });
        }
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