<script setup lang="ts">
import { computed } from 'vue'
import { getButtonAttrs, type ButtonProps } from '@scottmallin/core'

// Props are the registry-generated type — the compiler rejects any prop the
// registry doesn't declare, matching what the ESLint rule enforces in templates.
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
})

// Every class below is a token-backed utility (see apps/playground @theme inline).
// No raw colours, no arbitrary values — both are lint errors elsewhere in the repo.
const VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-action-primary hover:bg-action-primary-hover text-action-primary-fg',
  secondary: 'bg-action-secondary hover:bg-action-secondary-hover text-action-secondary-fg',
  danger: 'bg-action-danger hover:bg-action-danger-hover text-action-danger-fg',
}

const SIZE: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-control-md py-control-sm text-sm',
  md: 'px-control-lg py-control-md',
  lg: 'px-control-lg py-control-lg text-lg',
}

const a11y = computed(() => getButtonAttrs({ disabled: props.disabled }))
</script>

<template>
  <button
    v-bind="a11y"
    :class="[
      'inline-flex items-center justify-center gap-stack-sm rounded-control font-medium transition-colors',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action-primary',
      'disabled:cursor-not-allowed disabled:opacity-60',
      VARIANT[variant],
      SIZE[size],
    ]"
  >
    <slot name="icon-left" />
    <slot />
  </button>
</template>
