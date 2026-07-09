'use client'

import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from '@lexical/react/LexicalAutoLinkPlugin'

const URL_MATCHER = createLinkMatcherWithRegExp(
  /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i,
  (text) =>
    text.startsWith('http')
      ? text
      : `https://${text}`
)

export default function ComposerLinkPlugin() {
  return (
    <>
      <LinkPlugin />

      <AutoLinkPlugin
        matchers={[URL_MATCHER]}
      />
    </>
  )
}