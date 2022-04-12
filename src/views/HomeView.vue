<template>
  <div class="home">
    <div class="input-container">
      <NumberInput class="input" :min="1" :max="99" v-model="config.cols" label="Width" />
      <NumberInput class="input" :min="1" :max="99" v-model="config.rows" label="Height" />
      <NumberInput class="input" :min="1" :max="999" v-model="config.mines" label="Mines" />
    </div>
    <div class="input-container">
      <SliderInput class="input" :min="1" :max="2" step="0.1" v-model="config.zoom" label="Zoom" />
    </div>
    <MineSweeper v-bind="config" />
  </div>
</template>

<script>
import MineSweeper from '@/components/MineSweeper.vue'
import NumberInput from '@/components/NumberInput.vue'
import SliderInput from '@/components/SliderInput.vue'

export default {
  name: 'HomeView',
  components: {
    MineSweeper,
    NumberInput,
    SliderInput,
  },
  data() {
    return {
      config: {
        rows: 20,
        cols: 40,
        mines: 60,
        zoom: 1,
      },
    }
  },
}
</script>

<style scoped>
.input-container {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
}

.input {
  font-size: 2rem;
}
</style>
