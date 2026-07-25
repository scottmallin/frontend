<script setup lang="ts">
import type { BadgeProps } from '@scottmallin/core'

withDefaults(defineProps<BadgeProps>(), { variant: 'neutral' })

const VARIANT: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'bg-surface-overlay text-fg-muted',
  info: 'bg-feedback-info text-feedback-info-fg',
  success: 'bg-feedback-success text-feedback-success-fg',
  warning: 'bg-feedback-warning text-feedback-warning-fg',
  danger: 'bg-feedback-danger text-feedback-danger-fg',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-badge px-control-md py-control-sm text-sm font-medium',
      VARIANT[variant],
    ]"
  >
    <slot />
  </span>
</template>
