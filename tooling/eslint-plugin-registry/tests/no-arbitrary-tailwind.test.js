const test = require('node:test')
const { RuleTester } = require('eslint')
const vueParser = require('vue-eslint-parser')
const rule = require('../rules/no-arbitrary-tailwind')

RuleTester.describe = test.describe
RuleTester.it = test.it

const ruleTester = new RuleTester({
  languageOptions: { parser: vueParser, ecmaVersion: 2022, sourceType: 'module' },
})

ruleTester.run('no-arbitrary-tailwind', rule, {
  valid: [
    { code: '<template><div class="bg-action-primary rounded-control p-card" /></template>', filename: 'ok.vue' },
    { code: "<template><div :class=\"['bg-surface-raised', 'text-fg-default']\" /></template>", filename: 'ok.vue' },
  ],
  invalid: [
    {
      code: '<template><div class="bg-[#bada55]" /></template>',
      filename: 'bad.vue',
      errors: [{ messageId: 'arbitrary' }],
    },
    {
      code: '<template><div class="p-[13px] text-fg-default" /></template>',
      filename: 'bad.vue',
      errors: [{ messageId: 'arbitrary' }],
    },
    {
      code: "<template><div :class=\"'w-[42rem]'\" /></template>",
      filename: 'bad.vue',
      errors: [{ messageId: 'arbitrary' }],
    },
  ],
})
