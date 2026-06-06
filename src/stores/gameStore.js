import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    playerName: '',
    playerGender: null, // 'boy' or 'girl'
    isIntroActive: true,
    dialogueText: '' // For the HUD to display
  }),
  actions: {
    setPlayer(name, gender) {
      this.playerName = name;
      this.playerGender = gender;
    },
    endIntro() {
      this.isIntroActive = false;
    }
  }
});