const noRawHexColor = require('./rules/no-raw-hex-color')
const noArbitraryTailwind = require('./rules/no-arbitrary-tailwind')
const registryOnlyProps = require('./rules/registry-only-props')

const plugin = {
  meta: {
    name: '@scottmallin/eslint-plugin-registry',
    version: '0.0.0',
  },
  rules: {
    'no-raw-hex-color': noRawHexColor,
    'no-arbitrary-tailwind': noArbitraryTailwind,
    'registry-only-props': registryOnlyProps,
  },
}

module.exports = plugin
