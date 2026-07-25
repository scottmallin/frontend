<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { getDialogAttrs, nextDialogId, type ModalProps } from '@scottmallin/core'

const props = withDefaults(defineProps<ModalProps>(), { size: 'md' })
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const titleId = nextDialogId()
const dialogAttrs = computed(() => getDialogAttrs({ titleId: props.title ? titleId : undefined }))

const SIZE: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

const panel = ref<HTMLElement | null>(null)
let lastFocused: HTMLElement | null = null

function close() {
  emit('update:open', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

// Escape-to-close, plus focus move-in on open and restore on close. A production
// version would add a full focus trap; the registry a11y note documents the intent.
watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastFocused = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      panel.value?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      lastFocused?.focus()
    }
  },
)

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-stack-md">
      <div class="absolute inset-0 bg-scrim" @click="close" />
      <div
        ref="panel"
        v-bind="dialogAttrs"
        tabindex="-1"
        :class="[
          'relative w-full rounded-modal bg-surface-overlay p-card text-fg-default shadow-overlay',
          SIZE[size],
        ]"
      >
        <h2 v-if="title" :id="titleId" class="mb-stack-md text-lg font-semibold">{{ title }}</h2>
        <div>
          <slot />
        </div>
        <footer v-if="$slots.footer" class="mt-stack-md flex justify-end gap-stack-sm">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>
