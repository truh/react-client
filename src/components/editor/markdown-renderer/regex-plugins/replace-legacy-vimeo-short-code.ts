import { RegexOptions } from '../../../../external-types/markdown-it-regex/interface'

export const replaceLegacyVimeoShortCode: RegexOptions = {
  name: 'legacy-vimeo-short-code',
  regex: /^{%vimeo ([\d]{6,11}) ?%}$/,
  replace: (match) => {
    // ESLint wants to collapse this tag, but then the tag won't be valid html anymore.
    // noinspection CheckTagEmptyBody
    return `<codimd-vimeo id="${match}"></codimd-vimeo>`
  }
}
