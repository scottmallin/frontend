const test = require('node:test')
const { RuleTester } = require('eslint')
const vueParser = require('vue-eslint-parser')
const rule = require('../rules/no-raw-hex-color')

RuleTester.describe = test.describe
RuleTester.it = test.it

const vueTester = new RuleTester({
  languageOptions: { parser: vueParser, ecmaVersion: 2022, sourceType: 'module' },
})

const tsTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
})

vueTester.run('no-raw-hex-color (templates)', rule, {
  valid: [
    { code: '<template><div class="bg-action-primary" /></template>', filename: 'ok.vue' },
  ],
  invalid: [
    {
      code: '<template><div style="color: #ff0000" /></template>',
      filename: 'bad.vue',
      errors: [{ messageId: 'rawHex' }],
    },
  ],
})

tsTester.run('no-raw-hex-color (scripts)', rule, {
  valid: [
    { code: "const label = 'not a colour'", filename: 'x.ts' },
    // packages/tokens is exempt — it is the source of raw colour values.
    { code: "export const brand = '#3B5BDB'", filename: 'packages/tokens/src/x.ts' },
  ],
  invalid: [
    {
      code: "const brand = '#3B5BDB'",
      filename: 'packages/vue/src/x.ts',
      errors: [{ messageId: 'rawHex' }],
    },
  ],
})
