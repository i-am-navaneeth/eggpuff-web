'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import {
  TEXT_FORMAT_TRANSFORMERS,
  STRIKETHROUGH,
} from '@lexical/markdown'

import EditorOnChangePlugin from './OnChangePlugin'
import LinkPlugin from './LinkPlugin'
import { LinkNode, AutoLinkNode } from '@lexical/link'

type Props = {
  value: string
  onChange: (
    text: string,
    richContent: string
  ) => void
}

const theme = {
  paragraph: 'editor-paragraph',
  link: 'editor-link',
}

const SINGLE_STRIKETHROUGH = {
  ...STRIKETHROUGH,
  tag: '~',
}

export default function ComposerEditor({
  value,
  onChange,
}: Props) {
  const initialConfig = {
  namespace: 'EggPuffComposer',

  theme,

  onError(error: Error) {
    throw error
  },

  nodes: [
  LinkNode,
  AutoLinkNode,
],
}

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
  contentEditable={
    <ContentEditable
  className="editor-input"
  style={{
    minHeight: 34,

    maxHeight: '38vh',

    overflowY: 'auto',

    overflowX: 'hidden',

    WebkitOverflowScrolling: 'touch',

    paddingRight: 2,
  }}
/>
  }
  placeholder={
    <div className="composer-placeholder">
      Share your thoughts here...
    </div>
  }
  ErrorBoundary={LexicalErrorBoundary}
/>

      <HistoryPlugin />

<AutoFocusPlugin />

<MarkdownShortcutPlugin
  transformers={[
    ...TEXT_FORMAT_TRANSFORMERS.filter(
      (transformer) =>
        transformer !== STRIKETHROUGH
    ),
    SINGLE_STRIKETHROUGH,
  ]}
/>

<LinkPlugin />

<EditorOnChangePlugin
  onChange={(text, richContent) => {
    onChange(text, richContent)

    requestAnimationFrame(() => {
      const editor = document.querySelector(
        '.editor-input'
      )

      if (editor) {
        editor.scrollTop =
          editor.scrollHeight
      }
    })
  }}
/>
    </LexicalComposer>
  )
}