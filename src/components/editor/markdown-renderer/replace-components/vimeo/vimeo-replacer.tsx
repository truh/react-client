import { DomElement } from 'domhandler'
import React from 'react'
import { getAttributesFromCodiMdTag } from '../codi-md-tag-utils'
import { ComponentReplacer } from '../ComponentReplacer'
import { VimeoFrame } from './vimeo-frame'

export class VimeoReplacer implements ComponentReplacer {
  private counterMap: Map<string, number> = new Map<string, number>()

  getReplacement (node: DomElement): React.ReactElement | undefined {
    const attributes = getAttributesFromCodiMdTag(node, 'vimeo')
    if (attributes && attributes.id) {
      const videoId = attributes.id
      const count = (this.counterMap.get(videoId) || 0) + 1
      this.counterMap.set(videoId, count)
      return <VimeoFrame key={`vimeo_${videoId}_${count}`} id={videoId}/>
    }
  }
}
