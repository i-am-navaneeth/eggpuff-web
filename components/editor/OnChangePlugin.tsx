'use client'

import { OnChangePlugin as LexicalOnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { $getRoot } from 'lexical'

type Props = {
  onChange: (text: string) => void
}

export default function EditorOnChangePlugin({
  onChange,
}: Props) {
  return (
    <LexicalOnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          onChange($getRoot().getTextContent())
        })
      }}
    />
  )
}