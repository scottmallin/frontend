const { loadRegistry } = require('../lib/load-registry')

// Attributes that are never component props: HTML globals + framework plumbing.
// Everything else on a registered component is treated as a prop call-site.
const GLOBAL_ATTRS = new Set([
  'class',
  'style',
  'id',
  'role',
  'slot',
  'key',
  'ref',
  'is',
  'tabindex',
])

function isGlobalAttr(name) {
  return GLOBAL_ATTRS.has(name) || name.startsWith('data-') || name.startsWith('aria-')
}

/**
 * Extract the prop name and (if statically knowable) the literal value from a
 * template attribute. Returns null for anything out of scope: directives other
 * than v-bind, v-bind spread, dynamic arguments, and global attributes.
 */
function attrInfo(attr) {
  if (!attr.directive) {
    // Plain attribute: <Button variant="primary"> or boolean <Button disabled>.
    const name = attr.key && attr.key.name
    if (typeof name !== 'string' || isGlobalAttr(name)) return null
    const staticValue =
      attr.value && attr.value.type === 'VLiteral' ? attr.value.value : undefined
    return { name, valueNode: attr.value || attr, staticValue }
  }

  // Directive. Only v-bind (`:foo` / `v-bind:foo`) with a static identifier
  // argument names a prop; v-if/v-for/v-on/v-model/v-slot/etc. are not props.
  const directiveName = attr.key && attr.key.name && attr.key.name.name
  if (directiveName !== 'bind') return null

  const argument = attr.key.argument
  // `v-bind="obj"` (spread) has no argument; `:[dynamic]` has a non-identifier one.
  if (!argument || argument.type !== 'VIdentifier') return null

  const name = argument.name
  if (isGlobalAttr(name)) return null

  // Static value only when the bound expression is a plain string literal. Dynamic
  // bindings (`:variant="intent"`) are unknowable at lint time — skip the enum check
  // rather than false-positive.
  const expression = attr.value && attr.value.expression
  const staticValue =
    expression && expression.type === 'Literal' && typeof expression.value === 'string'
      ? expression.value
      : undefined

  return { name, valueNode: attr.value || attr, staticValue }
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow props not declared in the component registry, and enum values outside allowedValues.',
    },
    schema: [],
    messages: {
      unregisteredProp:
        '"{{prop}}" is not a registered prop on <{{component}}>. Add it to registry.json or use a registered prop.',
      invalidEnumValue:
        '"{{value}}" is not an allowed value for "{{prop}}" on <{{component}}>. Allowed: {{allowed}}.',
    },
  },
  create(context) {
    const registry = loadRegistry()
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    function checkElement(node) {
      const componentName = node.rawName
      const component = registry.get(componentName)
      if (!component) return // not a registered component — out of scope for this rule

      for (const attr of node.startTag.attributes) {
        const info = attrInfo(attr)
        if (!info) continue

        const prop = component.props.get(info.name)
        if (!prop) {
          context.report({
            node: info.valueNode,
            messageId: 'unregisteredProp',
            data: { prop: info.name, component: componentName },
          })
          continue
        }

        // Enum value validation — static literals only.
        if (prop.type === 'enum' && info.staticValue !== undefined) {
          const allowed = prop.allowedValues || []
          if (!allowed.includes(info.staticValue)) {
            context.report({
              node: info.valueNode,
              messageId: 'invalidEnumValue',
              data: {
                value: info.staticValue,
                prop: info.name,
                component: componentName,
                allowed: allowed.join(', '),
              },
            })
          }
        }
      }
    }

    const services = sourceCode.parserServices
    if (services && services.defineTemplateBodyVisitor) {
      return services.defineTemplateBodyVisitor({ VElement: checkElement }, {})
    }
    // Non-Vue files have no template to check.
    return {}
  },
}
