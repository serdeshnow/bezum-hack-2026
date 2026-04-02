import type { DocumentShortcodeBlock } from './types.ts'

function parseShortcode(line: string): DocumentShortcodeBlock | null {
  if (line.startsWith('[TASK_WIDGET:')) {
    return { type: 'task-widget', entityId: line.replace('[TASK_WIDGET:', '').replace(']', '') }
  }

  if (line.startsWith('[MEETING_SUMMARY:')) {
    return { type: 'meeting-summary', entityId: line.replace('[MEETING_SUMMARY:', '').replace(']', '') }
  }

  if (line.startsWith('[RELEASE_WIDGET:')) {
    return { type: 'release-widget', entityId: line.replace('[RELEASE_WIDGET:', '').replace(']', '') }
  }

  if (line.startsWith('[PR_REFERENCE:')) {
    return { type: 'pr-reference', entityId: line.replace('[PR_REFERENCE:', '').replace(']', '') }
  }

  return null
}

export function parseDocumentShortcodes(content: string): DocumentShortcodeBlock[] {
  return content.split('\n').map((line) => {
    const shortcode = parseShortcode(line)

    if (shortcode) return shortcode
    if (line.startsWith('# ')) return { type: 'heading-1', text: line.slice(2) }
    if (line.startsWith('## ')) return { type: 'heading-2', text: line.slice(3) }
    if (line.startsWith('- ')) return { type: 'list-item', text: line.slice(2) }

    return line ? { type: 'paragraph', text: line } : { type: 'spacer', text: '' }
  })
}
