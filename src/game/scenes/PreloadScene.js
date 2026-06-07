import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Green Emerald theme background habang naglo-load
    this.cameras.main.setBackgroundColor('#207868');

    // 1. VISUAL LOADING INDICATORS
    const loadingText = this.add.text(400, 280, 'LOADING ASSETS...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const percentText = this.add.text(400, 330, '0%', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#FFEA00'
    }).setOrigin(0.5);

    // I-update ang percentage habang nagda-download ang mga files
    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%');
    });

    // 2. LOAD DATABASES (JSON)
    this.load.json('dialogues', '/assets/data/dialogues.json');
    this.load.json('world_maps', '/assets/data/world_maps.json');

    // 3. LOAD TILEMAPS (Para sa unang bayan: Sproutwood Town)
    this.load.image('tiles', '/assets/tilemaps/exterior_tileset.png');
    this.load.tilemapTiledJSON('sproutwood_town', '/assets/tilemaps/sproutwood_town.json');

    // 4. LOAD PLAYER SPRITESHEET
    // *PAALALA: Kung ang sukat ng frames mo ay iba (hal. 32x48 o 32x32), palitan lang ang numbers sa ibaba*
    this.load.spritesheet('player_male', '/assets/sprites/player/player_male.png', {
      frameWidth: 32, // <--- PALITAN MO ITO BASE SA COMPUTATION SA TAAS
      frameHeight: 32 // <--- PALITAN MO ITO BASE SA COMPUTATION SA TAAS
    });

    this.load.spritesheet('npc_1', '/assets/sprites/npc/npc_1.png', {
    frameWidth: 16,
    frameHeight: 32
  });

  // I-load ang JSON file
  this.load.json('npcData', '/assets/data/npcs.json');
  }

  create() {
    // Kapag tapos na ang loading, pumunta muna sa Splash/Title Screen
    this.scene.start('SplashScene');
  }
}