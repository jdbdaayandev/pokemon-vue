import Phaser from 'phaser';

export class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SplashScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');

    const displayText = this.add.text(400, 300, '', {
      fontSize: '20px',
      fontFamily: '"Press Start 2P", monospace', 
      color: '#ffffff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);
    displayText.setAlpha(0);

    const proceedToNextScene = () => {
      // Tanggalin ang skip listeners para hindi mag-double trigger
      this.input.off('pointerdown', skipSequence);
      this.input.keyboard.off('keydown', skipSequence);
      
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('TitleScene');
      });
    };

    // --- GBA ANIMATION SEQUENCE ---

    // 1. "JDBD Games Presents"
    const anim1 = () => {
      displayText.setText('JDBD GAMES PRESENTS');
      displayText.setAlpha(1);
      displayText.setY(0); 

      this.tweens.add({
        targets: displayText,
        y: 300,
        duration: 1200,
        ease: 'Bounce.easeOut',
        onComplete: () => {
          this.time.delayedCall(1000, () => {
            displayText.setAlpha(0);
            anim2();
          });
        }
      });
    };

    // 2. "Inspired from POKEMON EMERALD"
    const anim2 = () => {
      displayText.setText('INSPIRED FROM\nPOKEMON EMERALD');
      displayText.setAlpha(1);
      displayText.setY(300);
      displayText.setScale(0); 

      this.tweens.add({
        targets: displayText,
        scale: 1,
        duration: 1000,
        ease: 'Back.easeOut', 
        onComplete: () => {
          this.time.delayedCall(1200, () => {
            this.tweens.add({
              targets: displayText,
              alpha: 0,
              duration: 300,
              onComplete: anim3
            });
          });
        }
      });
    };

    // 3. "GAME FREAK" - Pagkatapos nito, DERECHO TITLE NA!
    const anim3 = () => {
      displayText.setText('GAME FREAK');
      displayText.setColor('#F89800'); 
      displayText.setScale(1.2);
      
      this.tweens.add({
        targets: displayText,
        alpha: 1,
        duration: 800,
        onComplete: () => {
          // Phaser 4 Fix for flashing
          displayText.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
          
          this.time.delayedCall(150, () => {
            displayText.clearTint();
            
            this.time.delayedCall(1000, () => {
              this.tweens.add({
                targets: displayText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                  // Dito na didiretso sa Title Screen
                  proceedToNextScene();
                }
              });
            });
          });
        }
      });
    };

    // Simulan ang unang animation
    this.time.delayedCall(500, anim1);

    // Kapag naiinip ang player at pumindot, skip agad sa Title Screen
    const skipSequence = () => {
      this.tweens.killAll();
      this.time.removeAllEvents();
      proceedToNextScene();
    };

    this.input.once('pointerdown', skipSequence);
    this.input.keyboard.once('keydown', skipSequence);
  }
}