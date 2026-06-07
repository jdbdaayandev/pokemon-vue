// src/game/entities/NPC.js
import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';

export class NPC extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, collisionLayer) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    this.collisionLayer = collisionLayer;
    
    // Parehas na setup sa Player para pantay ang sukat at pwesto sa Grid
    this.setDepth(4); 
    this.setScale(1);
    this.setOrigin(0.5, 0.75);

    this.tileSize = 16;
    this.isMoving = false;
    this.moveSpeed = 220; // Bilis ng paglipat ng tile

    // --- WANDERING AI SETUP ---
    this.textureKey = texture;
    this.currentDirection = 'down';
    this.nextActionTime = 0; // Timer kung kailan siya ulit mag-iisip
    
    this.createAnimations(scene);
    this.faceDirection(this.currentDirection);
  }

  update() {
    if (this.isMoving) return;

    const currentTime = this.scene.time.now;

    if (currentTime > this.nextActionTime) {
      this.wander();
      
      const randomDelay = Phaser.Math.Between(1500, 4000);
      this.nextActionTime = currentTime + randomDelay;
    }
  }

  wander() {
    const dirIndex = Phaser.Math.Between(0, 3);
    const directions = ['up', 'down', 'left', 'right'];
    const chosenDirection = directions[dirIndex];

    let targetX = this.x;
    let targetY = this.y;

    if (chosenDirection === 'left') targetX -= this.tileSize;
    else if (chosenDirection === 'right') targetX += this.tileSize;
    else if (chosenDirection === 'up') targetY -= this.tileSize;
    else if (chosenDirection === 'down') targetY += this.tileSize;

    this.currentDirection = chosenDirection;
    this.tryMoveTo(targetX, targetY);
  }

  tryMoveTo(targetX, targetY) {
    if (!this.collisionLayer || this.canMoveTo(targetX, targetY)) {
      this.play(`${this.textureKey}-walk-${this.currentDirection}`, true);
      this.moveTo(targetX, targetY);
    } else {
      this.faceDirection(this.currentDirection);
    }
  }

  canMoveTo(targetX, targetY) {
    // 1. I-check kung may pader
    const tile = this.collisionLayer.getTileAtWorldXY(targetX, targetY, true);
    if (tile === null || tile.index !== -1) return false;

    // 2. LIGTAS NA CODE: I-check kung naroon ang Player (Brendan) gamit ang Math.abs
    if (Math.abs(this.scene.player.x - targetX) < 1 && Math.abs(this.scene.player.y - targetY) < 1) {
        return false; 
    }

    // 3. LIGTAS NA CODE: I-check kung may ibang NPC sa tile gamit ang ?. at Math.abs
    const hasOtherNPC = this.scene.npcs?.some(otherNpc => 
        otherNpc !== this && 
        Math.abs(otherNpc.x - targetX) < 1 && 
        Math.abs(otherNpc.y - targetY) < 1
    );
    if (hasOtherNPC) {
        return false; 
    }

    return true;
  }

  moveTo(targetX, targetY) {
    this.isMoving = true;

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: this.moveSpeed,
      onComplete: () => {
        this.isMoving = false;
        this.anims.stop(); 
        this.faceDirection(this.currentDirection);
      }
    });
  }

  createAnimations(scene) {
    if (scene.anims.exists(`${this.textureKey}-walk-down`)) return;

    scene.anims.create({
      key: `${this.textureKey}-walk-down`,
      frames: scene.anims.generateFrameNumbers(this.textureKey, { start: 0, end: 3 }),
      frameRate: 5, repeat: -1
    });

    scene.anims.create({
      key: `${this.textureKey}-walk-right`,
      frames: scene.anims.generateFrameNumbers(this.textureKey, { start: 8, end: 11 }),
      frameRate: 5, repeat: -1
    });

    scene.anims.create({
      key: `${this.textureKey}-walk-left`,
      frames: scene.anims.generateFrameNumbers(this.textureKey, { start: 4, end: 7 }),
      frameRate: 5, repeat: -1
    });

    scene.anims.create({
      key: `${this.textureKey}-walk-up`,
      frames: scene.anims.generateFrameNumbers(this.textureKey, { start: 12, end: 15 }),
      frameRate: 5, repeat: -1
    });
  }

  faceDirection(direction) {
    if (direction === 'down') this.setFrame(0);
    else if (direction === 'right') this.setFrame(8);  
    else if (direction === 'left') this.setFrame(4);   
    else if (direction === 'up') this.setFrame(12);    
  }

  interact(playerDirection) {
    this.nextActionTime = this.scene.time.now + 5000;
    this.anims.stop();

    if (playerDirection === 'up') this.faceDirection('down');
    else if (playerDirection === 'down') this.faceDirection('up');
    else if (playerDirection === 'left') this.faceDirection('right');
    else if (playerDirection === 'right') this.faceDirection('left');

    const store = useGameStore();
    if (this.dialogue && this.dialogue.length > 0) {
        store.showDialogue(this.npcName, this.dialogue);
    }
  }
}