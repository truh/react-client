import MarkdownIt from 'markdown-it/lib'
import Token from 'markdown-it/lib/token'

export const lineNumberMarker: MarkdownIt.PluginSimple = (md: MarkdownIt) => {
  // add codimd_linemarker token before each opening or self-closing level-0 tag
  md.core.ruler.push('line_number_marker', (state) => {
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i]
      if (token.level === 0 && token.nesting !== -1) {
        if (!token.map) {
          continue
        }
        const lineNumber = token.map[0] + 1
        const startToken = new Token('codimd_linemarker', 'codimd-linemarker', 0)
        startToken.attrPush(['data-linenumber', `${lineNumber}`])
        state.tokens.splice(i, 0, startToken)
        i++
      }
    }
    return true
  })

  // render codimd_linemarker token to <codimd-linemarker></codimd-linemarker>
  md.renderer.rules.codimd_linemarker = (tokens: Token[], index: number): string => {
    const lineNumber = tokens[index].attrGet('data-linenumber')
    if (!lineNumber) {
      // don't render broken linemarkers without a linenumber
      return ''
    }
    // noinspection CheckTagEmptyBody
    return `<codimd-linemarker data-linenumber='${lineNumber}'></codimd-linemarker>`
  }
}
