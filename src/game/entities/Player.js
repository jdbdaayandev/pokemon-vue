// src/game/entities/Player.js
import Phaser from 'phaser';
import { useGameStore } from '../../stores/gameStore';

export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, collisionLayer) {
    super(scene, x, y, 'player_male');

    scene.add.existing(this);
    
    this.collisionLayer = collisionLayer;
    this.setDepth(5); 
    this.setDepth(this.y);
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
    this.enterKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    this.targetX = x;
    this.targetY = y;
  }

  update() {
    this.setDepth(this.y);
    const store = useGameStore();
    
    // 🎮 SAFE CHECK: Kunin ang Gamepad kung naka-connect na
    const pad = this.scene.input.gamepad ? this.scene.input.gamepad.pad1 : null;

    // ==========================================
    // 🔴 UNIVERSAL INPUT FLAGS (Keyboard + Touch UI + USB Gamepad)
    // ==========================================
    const isStartPressed = Phaser.Input.Keyboard.JustDown(this.enterKey) || store.keys.start || (pad && pad.start);
    const isActionPressed = Phaser.Input.Keyboard.JustDown(this.interactKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey) || store.keys.action || (pad && pad.A);
    const isCancelPressed = store.keys.cancel || (pad && pad.B);

    const isUpPressed = this.cursors.up.isDown || this.wasd.up.isDown || store.keys.up || (pad && (pad.up || pad.leftStick.y < -0.5));
    const isDownPressed = this.cursors.down.isDown || this.wasd.down.isDown || store.keys.down || (pad && (pad.down || pad.leftStick.y > 0.5));
    const isLeftPressed = this.cursors.left.isDown || this.wasd.left.isDown || store.keys.left || (pad && (pad.left || pad.leftStick.x < -0.5));
    const isRightPressed = this.cursors.right.isDown || this.wasd.right.isDown || store.keys.right || (pad && (pad.right || pad.leftStick.x > 0.5));

    // ==========================================
    // 1. START MENU TOGGLE
    // ==========================================
    if (isStartPressed) {
      if (this.scene.time.now - (this.lastClickTime || 0) < 200) return; // Anti-spam delay
      this.lastClickTime = this.scene.time.now;
      
      store.keys.start = false; 
      store.toggleMenu();
      this.scene.sound.play('click');
      return; 
    }

    // ==========================================
    // 2. KUNG NAKABUKAS ANG START MENU
    // ==========================================
    if (store.menu.isOpen) {
      if (this.scene.time.now - (this.lastMenuTime || 0) > 150) {
        if (isUpPressed) {
            store.moveMenuUp();
            this.scene.sound.play('click');
            this.lastMenuTime = this.scene.time.now;
        } else if (isDownPressed) {
            store.moveMenuDown();
            this.scene.sound.play('click');
            this.lastMenuTime = this.scene.time.now;
        } else if (isActionPressed) {
            store.selectMenu();
            this.scene.sound.play('click');
            this.lastMenuTime = this.scene.time.now;
            store.keys.action = false;
        } else if (isCancelPressed) {
            store.toggleMenu(); 
            this.scene.sound.play('click');
            this.lastMenuTime = this.scene.time.now;
            store.keys.cancel = false;
        }
      }
      return; // PIGILAN ANG PAGLALAKAD kapag nasa menu!
    }

    // ==========================================
    // 3. DIALOGUE LOCK
    // ==========================================
    if (store.dialogue?.isOpen) {
      if (isActionPressed) {
          store.nextDialogue(); 
          store.keys.action = false; // Reset UI click
      }
      return; // PIGILAN ANG PAGLALAKAD habang bukas ang dialogue
    }

    // ==========================================
    // 4. MOVEMENT & INTERACTION
    // ==========================================
    if (this.isMoving) return;

    if (isActionPressed) {
        this.checkForInteract();
        store.keys.action = false;
        return; 
    }

    let intendedDirection = null;
    let targetX = this.x;
    let targetY = this.y;

    if (isLeftPressed) intendedDirection = 'left';
    else if (isRightPressed) intendedDirection = 'right';
    else if (isUpPressed) intendedDirection = 'up';
    else if (isDownPressed) intendedDirection = 'down';

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
    const tile = this.collisionLayer.getTileAtWorldXY(targetX, targetY, true);
    if (tile === null || tile.index !== -1) return false; 

    const hasNPC = this.scene.npcs?.some(npc => {
        const isStandingThere = Math.abs(npc.x - targetX) < 1 && Math.abs(npc.y - targetY) < 1;
        const isGoingThere = Math.abs(npc.targetX - targetX) < 1 && Math.abs(npc.targetY - targetY) < 1;
        return isStandingThere || isGoingThere; 
    });
    
    if (hasNPC) return false; 

    return true; 
  }

  moveTo(targetX, targetY) {
    this.isMoving = true;
    this.targetX = targetX;
    this.targetY = targetY;
    const store = useGameStore(); 

    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      duration: this.moveSpeed,
      onComplete: () => {
        this.isMoving = false;
        
        // 🎮 Basahin ulit nang mabilisan kung may nakadiin pa ba na button pagkashift
        const pad = this.scene.input.gamepad ? this.scene.input.gamepad.pad1 : null;
        const isLeftStillPressed = this.cursors.left.isDown || this.wasd.left.isDown || store.keys?.left || (pad && (pad.left || pad.leftStick.x < -0.5));
        const isRightStillPressed = this.cursors.right.isDown || this.wasd.right.isDown || store.keys?.right || (pad && (pad.right || pad.leftStick.x > 0.5));
        const isUpStillPressed = this.cursors.up.isDown || this.wasd.up.isDown || store.keys?.up || (pad && (pad.up || pad.leftStick.y < -0.5));
        const isDownStillPressed = this.cursors.down.isDown || this.wasd.down.isDown || store.keys?.down || (pad && (pad.down || pad.leftStick.y > 0.5));

        if (!isLeftStillPressed && !isRightStillPressed && !isUpStillPressed && !isDownStillPressed) {
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