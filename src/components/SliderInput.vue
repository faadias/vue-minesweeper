<template>
  <div class="wrapper">
    <label class="component__label">{{ label }}</label>
    <input v-bind="$attrs" :value="modelValue" type="range" class="component__input" @input="onInput" />
  </div>
</template>

<script>
export default {
  name: 'SliderInput',
  props: {
    label: String,
    modelValue: Number,
  },
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value)
    },
    onInput(event) {
      this.updateValue(parseFloat(event.target.value))
    },
  },
}
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.component__label {
  font-weight: bold;
  font-size: 1rem;
}
.component__input {
  font-size: inherit;
}
</style>
