// Matches Tailwind arbitrary-value syntax, e.g. `bg-[#bada55]`, `p-[13px]`, `w-[42rem]`.
//
// NOTE: this is a deliberate REGEX HEURISTIC, not a real Tailwind class-list AST
// parse. It does not understand variants, `theme()` calls, or config-driven safelists,
// and it only inspects strings that syntactically look like class lists. A production
// version would parse the class list properly. See the plugin README + root README's
// "Known limitations".
const ARBITRARY_PATTERN = /-\[[^\]]+\]/

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Tailwind arbitrary-value syntax (regex heuristic).',
    },
    schema: [],
    messages: {
      arbitrary:
        'Arbitrary Tailwind value "{{cls}}" is not allowed. Use a registered token-backed utility class instead.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode()

    function checkClassString(node, classString) {
      for (const cls of classString.split(/\s+/).filter(Boolean)) {
        if (ARBITRARY_PATTERN.test(cls)) {
          context.report({ node, messageId: 'arbitrary', data: { cls } })
        }
      }
    }

    function checkLiteral(node) {
      // Heuristic: only inspect strings that look like they contain arbitrary syntax,
      // to avoid false-positiving on unrelated string literals.
      if (typeof node.value === 'string' && node.value.includes('-[')) {
        checkClassString(node, node.value)
      }
    }

    const templateVisitor = {
      // Plain class="..." (directive === false).
      VAttribute(node) {
        if (!node.directive && node.key && node.key.name === 'class' && node.value && node.value.value) {
          checkClassString(node, node.value.value)
        }
      },
      // Literals inside :class / bound expressions.
      Literal: checkLiteral,
    }

    const scriptVisitor = {
      Literal: checkLiteral,
    }

    const services = sourceCode.parserServices
    if (services && services.defineTemplateBodyVisitor) {
      return services.defineTemplateBodyVisitor(templateVisitor, scriptVisitor)
    }
    return scriptVisitor
  },
}
