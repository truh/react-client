import React, { useRef, useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import { TocAst } from '../../../external-types/markdown-it-toc-done-right/interface'
import { MarkdownRenderer } from '../markdown-renderer/markdown-renderer'
import { MarkdownToc } from '../markdown-toc/markdown-toc'

interface RenderWindowProps {
    content: string
}

export const RenderWindow: React.FC<RenderWindowProps> = ({ content }) => {
  const [tocAst, setTocAst] = useState<TocAst>()
  const renderer = useRef<HTMLDivElement>(null)
  const { width } = useResizeObserver({ ref: renderer })

  return (
    <div className={'bg-light container-fluid flex-fill pb-5 flex-row d-flex min-h-100'} ref={renderer}>
      <div className={'col-md'}/>
      <MarkdownRenderer
        content={content}
        className={'container-fluid'}
        onTocChange={(tocAst) => setTocAst(tocAst)}/>

      <div className={'col-md'}>
        {
          (width || 0) >= 1280 && tocAst ? (
            <MarkdownToc ast={tocAst}/>
          ) : null
        }
      </div>
    </div>
  )
}
