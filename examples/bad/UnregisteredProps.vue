<!--
  INTENTIONAL VIOLATION — do not "fix" this file.
  Trips: registry/registry-only-props twice —
    - variant="ghost"  → not in Button's allowedValues (primary|secondary|danger)
    - tone="loud"      → not a registered Button prop at all
  A correct call-site: <Button variant="secondary" size="md" />
-->
<template>
  <Button variant="ghost" tone="loud" size="md">Ghost</Button>
</template>
