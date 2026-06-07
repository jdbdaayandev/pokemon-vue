import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    keys: { up: false, down: false, left: false, right: false, action: false, cancel: false, start: false, select: false },
    playerName: 'Brendan', 
    dialogue: {
      isOpen: false,
      name: '',
      lines: [],
      currentLine: 0,
      isTyping: false
    },
    // 🔴 BAGONG STATE: Para sa Start Menu
    menu: {
      isOpen: false,
      selectedIndex: 0,
    }
  }),
  
  // 🔴 BAGONG CODE: Getters para makuha ang totoong pangalan sa menu
  getters: {
    menuItems: (state) => ['POKÉDEX', 'POKÉMON', 'BAG', 'POKÉNAV', state.playerName, 'SAVE', 'OPTION', 'EXIT']
  },

  actions: {
    setPlayerName(newName) {
      this.playerName = newName;
      localStorage.setItem('vueBoyAdvance_saveName', newName);
    },
    loadSaveData() {
      const savedName = localStorage.getItem('vueBoyAdvance_saveName');
      if (savedName) {
        this.playerName = savedName;
        return true;
      }
      return false;
    },
    showDialogue(npcName, npcLines) {
      this.dialogue.name = npcName;
      const processedLines = npcLines.map(line => line.replace(/{playerName}/g, this.playerName));
      this.dialogue.lines = processedLines;
      this.dialogue.currentLine = 0;
      this.dialogue.isOpen = true;
      this.dialogue.isTyping = true; 
    },
    nextDialogue() {
      if (this.dialogue.isTyping) {
        this.dialogue.isTyping = false; 
        return false; 
      }
      if (this.dialogue.currentLine < this.dialogue.lines.length - 1) {
        this.dialogue.currentLine++; 
        this.dialogue.isTyping = true; 
        return true; 
      } else {
        this.dialogue.isOpen = false; 
        return false; 
      }
    },

    // =====================================
    // 🔴 BAGONG ACTIONS: Menu Controls
    // =====================================
    toggleMenu() {
      if (this.dialogue.isOpen) return; // Bawal buksan kung may kausap
      this.menu.isOpen = !this.menu.isOpen;
      this.menu.selectedIndex = 0; // I-reset sa taas pagbukas
    },
    moveMenuUp() {
      if (this.menu.selectedIndex > 0) this.menu.selectedIndex--;
      else this.menu.selectedIndex = this.menuItems.length - 1; // Pabalik sa ilalim
    },
    moveMenuDown() {
      if (this.menu.selectedIndex < this.menuItems.length - 1) this.menu.selectedIndex++;
      else this.menu.selectedIndex = 0; // Pabalik sa taas
    },
    selectMenu() {
      const selected = this.menuItems[this.menu.selectedIndex];
      
      if (selected === 'EXIT') {
        this.menu.isOpen = false;
      } else if (selected === 'SAVE') {
        this.menu.isOpen = false;
        // Placeholder save notification
        this.showDialogue('SYSTEM', ['Your game progress has been saved!']);
      } else {
        this.menu.isOpen = false;
        this.showDialogue('SYSTEM', [`Selected ${selected}.`, 'This feature is coming soon!']);
      }
    }
  }
});