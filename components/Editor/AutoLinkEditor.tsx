'use client'

import MarkdownEditor from './MarkdownEditor'
import type { AutoLinkEditorProps } from '@/types'

export default function AutoLinkEditor({ initialCategoryId, ...props }: AutoLinkEditorProps) {
  return <MarkdownEditor initialCategoryId={initialCategoryId} {...props} />
}
