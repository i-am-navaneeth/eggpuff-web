'use client'

import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'

import EditorOnChangePlugin from './OnChangePlugin'
import LinkPlugin from './LinkPlugin'
import { LinkNode, AutoLinkNode } from '@lexical/link'

type Props = {
  value: string
  onChange: (text: string) => void
}

const theme = {
  paragraph: 'editor-paragraph',
  link: 'editor-link',
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

      <LinkPlugin />

      <EditorOnChangePlugin
        onChange={(text) => {
    onChange(text)

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