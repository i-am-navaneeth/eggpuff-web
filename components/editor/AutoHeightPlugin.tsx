'use client'

import { useEffect } from 'react'
import {
  $getRoot,
} from 'lexical'
import {
  useLexicalComposerContext,
} from '@lexical/react/LexicalComposerContext'

export default function AutoHeightPlugin() {
  const [editor] =
    useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const root =
        editor.getRootElement()

      if (!root) return

      root.style.height = 'auto'

      root.style.height =
        root.scrollHeight + 'px'
    })
  }, [editor])

  return null
}