<template>
  <div class="wrapper">
    <label class="component__label">{{ label }}</label>
    <input v-bind="$attrs" :value="modelValue" type="number" class="component__input" @blur="onBlur" @input="onInput" />
  </div>
</template>

<script>
export default {
  name: 'NumberInput',
  props: {
    label: String,
    modelValue: Number,
  },
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value)
    },
    onInput(event) {
      this.updateValue(parseInt(event.target.value))
    },
    onBlur() {
      let value = this.modelValue || 0
      const { min, max } = this.$attrs

      if (min) {
        value = Math.max(value, min)
      }
      if (max) {
        value = Math.min(value, max)
      }

      if (value !== this.modelValue) {
        this.updateValue(value)
      }
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
