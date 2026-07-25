const HEX_PATTERN = /#(?:[0-9a-fA-F]{3}){1,2}\b/

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow raw hex colour values outside the tokens package.',
    },
    schema: [],
    messages: {
      rawHex:
        'Raw hex colour "{{value}}" found outside packages/tokens. Reference a design token instead.',
    },
  },
  create(context) {
    // packages/tokens is the one place raw hex is legitimate — it's the source of
    // the tokens. Normalise separators so the exemption holds on Windows and POSIX.
    const filename = (context.filename ?? context.getFilename()).replace(/\\/g, '/')
    if (/(^|\/)packages\/tokens\//.test(filename)) return {}

    const sourceCode = context.sourceCode ?? context.getSourceCode()

    function check(node, value) {
      if (typeof value !== 'string') return
      const match = HEX_PATTERN.exec(value)
      if (match) {
        context.report({ node, messageId: 'rawHex', data: { value: match[0] } })
      }
    }

    // <script> and plain .ts/.js files.
    const scriptVisitor = {
      Literal(node) {
        check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value && node.value.cooked)
      },
    }

    // Template body (only reached via defineTemplateBodyVisitor). VLiteral is a
    // plain attribute value; Literal covers literals inside bound expressions.
    const templateVisitor = {
      VLiteral(node) {
        check(node, node.value)
      },
      Literal(node) {
        check(node, node.value)
      },
    }

    const services = sourceCode.parserServices
    if (services && services.defineTemplateBodyVisitor) {
      return services.defineTemplateBodyVisitor(templateVisitor, scriptVisitor)
    }
    return scriptVisitor
  },
}
