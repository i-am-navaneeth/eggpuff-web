'use client'

import { OnChangePlugin as LexicalOnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $getRoot } from 'lexical'

type Props = {
  onChange: (
    text: string,
    richContent: string
  ) => void
}

export default function EditorOnChangePlugin({
  onChange,
}: Props) {
  return (
    <LexicalOnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const text = $getRoot().getTextContent()

          const richContent = JSON.stringify(
  editorState.toJSON()
)

console.log(
  '🔥 EGGPuff RICH:',
  JSON.stringify(
    editorState.toJSON(),
    null,
    2
  )
)

onChange(text, richContent)
        })
      }}
    />
  )
}