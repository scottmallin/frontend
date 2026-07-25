<script setup lang="ts">
import { computed } from 'vue'
import { getInputAttrs, type InputProps } from '@scottmallin/core'

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  size: 'md',
  invalid: false,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const SIZE: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'px-control-md py-control-sm text-sm',
  md: 'px-control-md py-control-md',
  lg: 'px-control-lg py-control-md text-lg',
}

const a11y = computed(() => getInputAttrs({ invalid: props.invalid, disabled: props.disabled }))

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    v-bind="a11y"
    :class="[
      'w-full rounded-control border bg-surface-raised text-fg-default transition-colors',
      'placeholder:text-fg-muted',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary',
      'disabled:cursor-not-allowed disabled:opacity-60',
      invalid ? 'border-action-danger' : 'border-surface-border',
      SIZE[size],
    ]"
    @input="onInput"
  />
</template>
