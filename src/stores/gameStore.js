import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    // Dito nakatago ang mga pinindot mo sa onscreen D-pad (kung meron man)
    keys: { up: false, down: false, left: false, right: false },
    
    // ITO ANG NAWAWALA KANINA: Kailangan i-declare muna ang dialogue object dito!
    dialogue: {
      isOpen: false,
      name: '',
      lines: [],
      currentLine: 0
    }
  }),
  
  actions: {
    showDialogue(npcName, npcLines) {
      // Ngayong nasa state na ang dialogue, hindi na ito mag-u-undefined
      this.dialogue.name = npcName;
      this.dialogue.lines = npcLines;
      this.dialogue.currentLine = 0;
      this.dialogue.isOpen = true;
    },
    
    nextDialogue() {
      if (this.dialogue.currentLine < this.dialogue.lines.length - 1) {
        this.dialogue.currentLine++; // Ilipat sa susunod na sentence
        return true; 
      } else {
        this.dialogue.isOpen = false; // Isara ang box kung tapos na ang usapan
        return false; 
      }
    }
  }
});