import { DomElement } from 'domhandler'
import yaml from 'js-yaml'
import MarkdownIt from 'markdown-it'
import abbreviation from 'markdown-it-abbr'
import markdownItContainer from 'markdown-it-container'
import definitionList from 'markdown-it-deflist'
import emoji from 'markdown-it-emoji'
import footnote from 'markdown-it-footnote'
import frontmatter from 'markdown-it-front-matter'
import inserted from 'markdown-it-ins'
import marked from 'markdown-it-mark'
import markdownItRegex from 'markdown-it-regex'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import taskList from 'markdown-it-task-lists'
import React, { ReactElement, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-bootstrap'
import ReactHtmlParser, { convertNodeToElement, Transform } from 'react-html-parser'
import { Trans } from 'react-i18next'
import { InternalLink } from '../../common/links/internal-link'
import { ShowIf } from '../../common/show-if/show-if'
import { isEqual, RawYAMLMetadata, YAMLMetaData } from '../yaml-metadata/yaml-metadata'
import { createRenderContainer, validAlertLevels } from './container-plugins/alert'
import { MarkdownItParserDebugger } from './markdown-it-plugins/parser-debugger'
import './markdown-renderer.scss'
import { replaceGistLink } from './regex-plugins/replace-gist-link'
import { replaceLegacyGistShortCode } from './regex-plugins/replace-legacy-gist-short-code'
import { replaceLegacySlideshareShortCode } from './regex-plugins/replace-legacy-slideshare-short-code'
import { replaceLegacySpeakerdeckShortCode } from './regex-plugins/replace-legacy-speakerdeck-short-code'
import { replaceLegacyVimeoShortCode } from './regex-plugins/replace-legacy-vimeo-short-code'
import { replaceLegacyYoutubeShortCode } from './regex-plugins/replace-legacy-youtube-short-code'
import { replacePdfShortCode } from './regex-plugins/replace-pdf-short-code'
import { replaceVimeoLink } from './regex-plugins/replace-vimeo-link'
import { replaceYouTubeLink } from './regex-plugins/replace-youtube-link'
import { getGistReplacement } from './replace-components/gist/gist-frame'
import { getPDFReplacement } from './replace-components/pdf/pdf-frame'
import { getVimeoReplacement } from './replace-components/vimeo/vimeo-frame'
import { getYouTubeReplacement } from './replace-components/youtube/youtube-frame'

export interface MarkdownPreviewProps {
  content: string
  onMetaDataChange?: (yamlMetaData: YAMLMetaData | null) => void
}

export type ComponentReplacer = (node: DomElement, counterMap: Map<string, number>) => (ReactElement | undefined);
const allComponentReplacers: ComponentReplacer[] = [getYouTubeReplacement, getVimeoReplacement, getGistReplacement, getPDFReplacement]
type ComponentReplacer2Identifier2CounterMap = Map<ComponentReplacer, Map<string, number>>

const tryToReplaceNode = (node: DomElement, componentReplacer2Identifier2CounterMap: ComponentReplacer2Identifier2CounterMap) => {
  return allComponentReplacers
    .map((componentReplacer) => {
      const identifier2CounterMap = componentReplacer2Identifier2CounterMap.get(componentReplacer) || new Map<string, number>()
      return componentReplacer(node, identifier2CounterMap)
    })
    .find((replacement) => !!replacement)
}

const MarkdownRenderer: React.FC<MarkdownPreviewProps> = ({ content, onMetaDataChange }) => {
  const [yamlError, setYamlError] = useState(false)
  const [rawMetaData, setRawMetaData] = useState<RawYAMLMetadata>()
  const [oldRawMetaData, setOldRawMetaData] = useState<RawYAMLMetadata>()

  useEffect(() => {
    if (onMetaDataChange && rawMetaData && oldRawMetaData && !isEqual(oldRawMetaData, rawMetaData)) {
      const newMetaData = new YAMLMetaData(rawMetaData)
      onMetaDataChange(newMetaData)
      setOldRawMetaData(rawMetaData)
    }
  }, [rawMetaData, onMetaDataChange, oldRawMetaData])

  const markdownIt = useMemo(() => {
    const md = new MarkdownIt('default', {
      html: true,
      breaks: true,
      langPrefix: '',
      typographer: true
    })
    if (onMetaDataChange) {
      md.use(frontmatter, (rawMeta: string) => {
        try {
          const meta: RawYAMLMetadata = yaml.safeLoad(rawMeta) as RawYAMLMetadata
          setYamlError(false)
          setRawMetaData(meta)
        } catch (e) {
          console.error(e)
          setYamlError(true)
          setRawMetaData({} as RawYAMLMetadata)
        }
      })
    }
    md.use(taskList)
    md.use(emoji)
    md.use(abbreviation)
    md.use(definitionList)
    md.use(subscript)
    md.use(superscript)
    md.use(inserted)
    md.use(marked)
    md.use(footnote)
    md.use(markdownItRegex, replaceLegacyYoutubeShortCode)
    md.use(markdownItRegex, replaceLegacyVimeoShortCode)
    md.use(markdownItRegex, replaceLegacyGistShortCode)
    md.use(markdownItRegex, replaceLegacySlideshareShortCode)
    md.use(markdownItRegex, replaceLegacySpeakerdeckShortCode)
    md.use(markdownItRegex, replacePdfShortCode)
    md.use(markdownItRegex, replaceYouTubeLink)
    md.use(markdownItRegex, replaceVimeoLink)
    md.use(markdownItRegex, replaceGistLink)
    md.use(MarkdownItParserDebugger)

    validAlertLevels.forEach(level => {
      md.use(markdownItContainer, level, { render: createRenderContainer(level) })
    })

    return md
  }, [onMetaDataChange])

  const result: ReactElement[] = useMemo(() => {
    const componentReplacer2Identifier2CounterMap = new Map<ComponentReplacer, Map<string, number>>()
    const html: string = markdownIt.render(content)
    const transform: Transform = (node, index) => {
      return tryToReplaceNode(node, componentReplacer2Identifier2CounterMap) || convertNodeToElement(node, index, transform)
    }
    return ReactHtmlParser(html, { transform: transform })
  }, [content, markdownIt])

  return (
    <div className={'bg-light container-fluid flex-fill h-100 overflow-y-scroll pb-5'}>
      <div className={'markdown-body container-fluid'}>
        <ShowIf condition={yamlError}>
          <Alert variant='warning' dir='auto'>
            <Trans i18nKey='editor.invalidYaml'>
              <InternalLink text='yaml-metdata' href='/n/yaml-metadata'/>
            </Trans>
          </Alert>
        </ShowIf>
        {result}
      </div>
    </div>
  )
}

export { MarkdownRenderer }