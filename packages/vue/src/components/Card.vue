<script setup lang="ts">
import type { CardProps } from '@scottmallin/core'

withDefaults(defineProps<CardProps>(), { elevation: 'raised' })

const ELEVATION: Record<NonNullable<CardProps['elevation']>, string> = {
  flat: 'shadow-flat',
  raised: 'shadow-raised',
  overlay: 'shadow-overlay',
}
</script>

<template>
  <div
    :class="[
      'rounded-card border border-surface-border bg-surface-raised p-card text-fg-default',
      ELEVATION[elevation],
    ]"
  >
    <header v-if="$slots.header" class="mb-stack-md">
      <slot name="header" />
    </header>
    <div>
      <slot />
    </div>
    <footer v-if="$slots.footer" class="mt-stack-md">
      <slot name="footer" />
    </footer>
  </div>
</template>
