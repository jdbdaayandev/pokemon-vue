<template>
  <div v-if="store.menu.isOpen" class="start-menu-container">
    <div class="start-menu">
      <div 
        v-for="(item, index) in store.menuItems" 
        :key="index" 
        class="menu-item"
      >
        <span 
          class="cursor" 
          :style="{ visibility: store.menu.selectedIndex === index ? 'visible' : 'hidden' }"
        >▶</span>
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '../stores/gameStore';
const store = useGameStore();
</script>

<style scoped>
.start-menu-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  pointer-events: auto;
}

.start-menu {
  background-color: #f8f8f8;
  border: 4px solid #606060;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: inset 0 0 0 4px #d8d8d8, 0 8px 16px rgba(0,0,0,0.5);
  font-family: 'Press Start 2P', monospace;
  min-width: 180px;
}

.menu-item {
  font-size: 14px;
  color: #303030;
  line-height: 2.2;
  display: flex;
  align-items: center;
  text-shadow: 1px 1px 0px #e0e0e0;
}

.cursor {
  color: #e53935;
  margin-right: 10px;
  font-size: 14px;
  /* Tinanggal na natin ang animation dito kaya steady na siya! */
}
</style>