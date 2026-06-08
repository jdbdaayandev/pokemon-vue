import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { NPC } from '../entities/NPC';

export class Route1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Route1Scene' }); // 🔴 Pangalan ng Scene
  }

  init(data) {
    this.startPosition = {
      x: data.x !== undefined ? data.x : 100, // Default X kung dumeretso rito
      y: data.y !== undefined ? data.y : 100  // Default Y
    };
    this.isIntroDone = data.isIntroDone || true; // Pasa-pasahan ng flag
    this.isTransitioning = false;
    
    // 🔴 1. SALUHIN ANG DIRECTION DATA
    this.startDirection = data.direction || 'down'; 
  }

  create() {
    // 🔴 PALITAN ANG KEY DEPENDE SA KUNG ANO ANG TINAWAG MO SA TILEMAP JSON MO SA PRELOAD
    const map = this.make.tilemap({ key: 'route_1' }); 
    const tileset = map.addTilesetImage('exterior_tileset', 'tiles'); // Assuming same tileset image gamit mo
    
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const collisionLayer = map.createLayer('Collission', tileset, 0, 0);
    const overheadLayer = map.createLayer('Overhead', tileset, 0, 0);
    
    if(overheadLayer) overheadLayer.setDepth(9999); 
    if(collisionLayer) collisionLayer.setVisible(false);

    // 🌟 REMOVED: Tinanggal na dito ang grass-splash-anim creation dahil GLOBAL na ito sa PreloadScene!

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(2);

    // ==========================================
    // 🔴 2. UNIVERSAL GRID SNAPPER
    // Hahatiin niya ang coordinate sa 16, bibilugin pababa, at isesentro (+8)
    // ==========================================
    const perfectX = Math.floor(this.startPosition.x / 16) * 16 + 8;
    const perfectY = Math.floor(this.startPosition.y / 16) * 16 + 8;

    this.player = new Player(this, perfectX, perfectY, collisionLayer, groundLayer);

    // 🔴 3. I-SET ANG DIRECTION NG PLAYER PAGKAPANGANAK
    if (this.player.faceDirection) {
        this.player.faceDirection(this.startDirection);
    }
    // ==========================================

    // BASAHIN ANG PORTALS LAYER (Para makabalik ka sa Sproutwood Town!)
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

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  update() {
    if (this.isTransitioning) return;

    if (this.player) {
        this.player.update();
        this.player.setDepth(this.player.y);

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
                            direction: 'down' // Pagbalik sa main town, nakaharap siya pababa!
                        });
                    });
                }
            });
        }
    }
  }
}