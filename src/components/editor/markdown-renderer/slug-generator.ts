export type SlugMode = 'keep-case' | 'lower-case' | 'gfm'

export class SlugGenerator {
  private readonly mode: SlugMode
  private gfmSlugs: Set<string>

  constructor (mode: SlugMode, slugSet: Set<string>) {
    this.mode = mode
    this.gfmSlugs = slugSet
  }

  private genBasic (text: string): string {
    const withoutTags = text.trim().replace(/<\/?[^>]+(>|$)/g, '')
    const withoutSpecialChars = withoutTags.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '')
    return withoutSpecialChars.replace(/\s+/g, '-')
  }

  private genLowerCase (text: string): string {
    return this.genBasic(text).toLowerCase()
  }

  private genGFM (text: string): string {
    const slugBase = this.genLowerCase(text)
    let slug = slugBase
    let counter = 1
    while (this.gfmSlugs.has(slug)) {
      slug = `${slugBase}-${counter}`
      counter++
    }
    this.gfmSlugs.add(slug)
    return slug
  }

  generateSlug (text: string): string {
    switch (this.mode) {
      case 'keep-case':
        return this.genBasic(text)
      case 'lower-case':
        return this.genLowerCase(text)
      case 'gfm':
        return this.genGFM(text)
    }
  }
}
