// src/game/entities/Player.js
import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, collisionLayer) {
    super(scene, x, y, 'player_male');

    scene.add.existing(this);
    
    this.collisionLayer = collisionLayer;
    this.setDepth(5); 
    this.setScale(1); 
    this.setOrigin(0.5, 0.75);

    // --- KEYBOARD INPUTS ---
    this.cursors = scene.input.keyboard.createCursorKeys(); 
    
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    this.tileSize = 16; 
    this.isMoving = false;
    this.moveSpeed = 220; 

    // --- TURN DELAY PROPERTIES ---
    this.currentDirection = 'down'; 
    this.moveDelayTimer = 0;        
    this.turnDelay = 120; 
    this.continuousWalk = false;

    this.createAnimations(scene);
    this.faceDirection(this.currentDirection);

    // ACTION KEYS
    this.interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update() {
    const store = useGameStore();

    // ==========================================
    // 1. DIALOGUE LOCK (Bagong Code)
    // ==========================================
    // Kung nakabukas ang dialogue box sa Vue...
    if (store.dialogue?.isOpen) {
      // At pinindot ng player ang 'Z' o 'Spacebar'...
      if (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
          store.nextDialogue(); // I-next ang linya ng dialogue
      }
      return; // PIGILAN ANG PAGLALAKAD habang bukas ang dialogue
    }

    // ==========================================
    // 2. MOVEMENT & INTERACTION
    // ==========================================
    if (this.isMoving) return;

    // Likumin ang interaction (Kung nakasara ang dialogue)
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.checkForInteract();
        return; 
    }

    let intendedDirection = null;
    let targetX = this.x;
    let targetY = this.y;

    if (this.cursors.left.isDown || this.wasd.left.isDown || store.keys?.left) intendedDirection = 'left';
    else if (this.cursors.right.isDown || this.wasd.right.isDown || store.keys?.right) intendedDirection = 'right';
    else if (this.cursors.up.isDown || this.wasd.up.isDown || store.keys?.up) intendedDirection = 'up';
    else if (this.cursors.down.isDown || this.wasd.down.isDown || store.keys?.down) intendedDirection = 'down';

    if (intendedDirection === 'left') targetX -= this.tileSize;
    else if (intendedDirection === 'right') targetX += this.tileSize;
    else if (intendedDirection === 'up') targetY -= this.tileSize;
    else if (intendedDirection === 'down') targetY += this.tileSize;

    if (intendedDirection) {
      if (this.currentDirection !== intendedDirection) {
        this.currentDirection = intendedDirection;
        this.faceDirection(this.currentDirection); 
        
        if (!this.continuousWalk) {
          this.moveDelayTimer = this.scene.time.now + this.turnDelay;
        }
      } 
      
      if (this.scene.time.now >= this.moveDelayTimer || this.continuousWalk) {
        this.continuousWalk = true; 
        this.play(`walk-${this.currentDirection}`, true);
        this.tryMoveTo(targetX, targetY);
      }
    } else {
      this.continuousWalk = false;
      this.stopAndIdle();
    }
  }

  tryMoveTo(targetX, targetY) {
    if (!this.collisionLayer || this.canMoveTo(targetX, targetY)) {
        this.moveTo(targetX, targetY);
    } else {
        this.anims.stop();
        this.faceDirection(this.currentDirection); 
    }
  }

  canMoveTo(targetX, targetY) {
    // 1. I-check kung may pader sa Tiled
    const tile = this.collisionLayer.getTileAtWorldXY(targetX, targetY, true);
    if (tile === null || tile.index !== -1) return false; 

    // 2. I-check kung may nakaharang na NPC (Ligtas na collision check)
    const hasNPC = this.scene.npcs?.some(npc => Math.abs(npc.x - targetX) < 1 && Math.abs(npc.y - targetY) < 1);
    if (hasNPC) return false; 

    return true; 
  }

  moveTo(targetX, targetY) {
    this.isMoving = true;
    const store = useGameStore(); 

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: this.moveSpeed,
      onComplete: () => {
        this.isMoving = false;
        
        const isLeftPressed = this.cursors.left.isDown || this.wasd.left.isDown || store.keys?.left;
        const isRightPressed = this.cursors.right.isDown || this.wasd.right.isDown || store.keys?.right;
        const isUpPressed = this.cursors.up.isDown || this.wasd.up.isDown || store.keys?.up;
        const isDownPressed = this.cursors.down.isDown || this.wasd.down.isDown || store.keys?.down;

        if (!isLeftPressed && !isRightPressed && !isUpPressed && !isDownPressed) {
             this.continuousWalk = false; 
             this.stopAndIdle();
        }
      }
    });
  }

  createAnimations(scene) {
    if (scene.anims.exists('walk-down')) return;

    scene.anims.create({
      key: 'walk-down',
      frames: scene.anims.generateFrameNumbers('player_male', { start: 0, end: 3 }),
      frameRate: 5,
      repeat: -1
    });

    scene.anims.create({
      key: 'walk-up',
      frames: scene.anims.generateFrameNumbers('player_male', { start: 4, end: 7 }), 
      frameRate: 5,
      repeat: -1
    });

    scene.anims.create({
      key: 'walk-right',
      frames: scene.anims.generateFrameNumbers('player_male', { start: 8, end: 11 }), 
      frameRate: 5,
      repeat: -1
    });

    scene.anims.create({
      key: 'walk-left',
      frames: scene.anims.generateFrameNumbers('player_male', { start: 12, end: 15 }), 
      frameRate: 5,
      repeat: -1
    });
  }

  faceDirection(direction) {
    this.anims.stop();
    if (direction === 'down') this.setFrame(0);
    else if (direction === 'up') this.setFrame(4);
    else if (direction === 'right') this.setFrame(8);
    else if (direction === 'left') this.setFrame(12);
  }

  stopAndIdle() {
    this.faceDirection(this.currentDirection);
  }

  checkForInteract() {
    let targetX = this.x;
    let targetY = this.y;

    if (this.currentDirection === 'left') targetX -= this.tileSize;
    else if (this.currentDirection === 'right') targetX += this.tileSize;
    else if (this.currentDirection === 'up') targetY -= this.tileSize;
    else if (this.currentDirection === 'down') targetY += this.tileSize;

    const npc = this.scene.npcs?.find(n => Math.abs(n.x - targetX) < 1 && Math.abs(n.y - targetY) < 1);
    
    if (npc) {
        npc.interact(this.currentDirection);
    }
  }
}