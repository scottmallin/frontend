<script setup lang="ts">
import { ref } from 'vue'

// Theme switching is a single [data-theme] flip on <html>; every token-backed
// utility re-resolves live. Bound via useHead so it also works during SSR.
const theme = ref<'nova' | 'ember'>('nova')
useHead({ htmlAttrs: { 'data-theme': theme } })
function toggleTheme() {
  theme.value = theme.value === 'nova' ? 'ember' : 'nova'
}

const email = ref('')
const modalOpen = ref(false)
</script>

<template>
  <main class="mx-auto max-w-3xl p-card">
    <header class="mb-stack-md flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Design System Playground</h1>
        <p class="text-fg-muted">Registry-governed components · token-driven theming</p>
      </div>
      <button
        class="rounded-control border border-surface-border px-control-md py-control-sm font-medium text-fg-default"
        @click="toggleTheme"
      >
        Theme: {{ theme }}
      </button>
    </header>

    <div class="grid gap-card-gap">
      <Card>
        <template #header><h2 class="font-medium">Buttons</h2></template>
        <div class="flex flex-wrap items-center gap-stack-sm">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" :disabled="true">Disabled</Button>
        </div>
      </Card>

      <Card>
        <template #header><h2 class="font-medium">Inputs</h2></template>
        <div class="grid gap-stack-md">
          <Input v-model="email" type="email" placeholder="you@example.com" />
          <Input :invalid="true" placeholder="Invalid state" />
          <Input :disabled="true" placeholder="Disabled" />
        </div>
      </Card>

      <Card>
        <template #header><h2 class="font-medium">Badges</h2></template>
        <div class="flex flex-wrap gap-stack-sm">
          <Badge>neutral</Badge>
          <Badge variant="info">info</Badge>
          <Badge variant="success">success</Badge>
          <Badge variant="warning">warning</Badge>
          <Badge variant="danger">danger</Badge>
        </div>
      </Card>

      <Card elevation="overlay">
        <template #header><h2 class="font-medium">Modal</h2></template>
        <Button variant="primary" @click="modalOpen = true">Open modal</Button>
        <Modal v-model:open="modalOpen" title="Confirm action" size="md">
          <p class="text-fg-muted">
            This dialog reads its colours, radius and shadow entirely from tokens.
          </p>
          <template #footer>
            <Button variant="secondary" @click="modalOpen = false">Cancel</Button>
            <Button variant="danger" @click="modalOpen = false">Delete</Button>
          </template>
        </Modal>
      </Card>
    </div>
  </main>
</template>
