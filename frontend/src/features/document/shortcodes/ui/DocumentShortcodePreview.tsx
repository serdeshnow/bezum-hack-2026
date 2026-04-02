import { CheckSquare, GitPullRequest, Rocket, Video } from 'lucide-react'

import type { DocumentShortcodeBlock } from '../model/types.ts'

type Props = {
  blocks: DocumentShortcodeBlock[]
}

export function DocumentShortcodePreview({ blocks }: Props) {
  return (
    <div className='space-y-4 rounded-xl border p-5'>
      {blocks.map((block, index) => (
        <div key={`${block.type}-${index}`}>
          {block.type === 'task-widget' && (
            <div className='border-accent bg-accent/10 flex items-center gap-2 rounded-lg border p-3 text-sm'>
              <CheckSquare className='size-4' />
              Linked task widget: {block.entityId}
            </div>
          )}
          {block.type === 'meeting-summary' && (
            <div className='bg-muted flex items-center gap-2 rounded-lg border p-3 text-sm'>
              <Video className='size-4' />
              Meeting summary widget: {block.entityId}
            </div>
          )}
          {block.type === 'release-widget' && (
            <div className='bg-muted flex items-center gap-2 rounded-lg border p-3 text-sm'>
              <Rocket className='size-4' />
              Release widget: {block.entityId}
            </div>
          )}
          {block.type === 'pr-reference' && (
            <div className='bg-muted flex items-center gap-2 rounded-lg border p-3 text-sm'>
              <GitPullRequest className='size-4' />
              Pull request reference: {block.entityId}
            </div>
          )}
          {block.type === 'heading-1' && <h2 className='text-xl font-semibold'>{block.text}</h2>}
          {block.type === 'heading-2' && <h3 className='text-lg font-semibold'>{block.text}</h3>}
          {block.type === 'list-item' && <li className='ml-5 list-disc'>{block.text}</li>}
          {block.type === 'paragraph' && <p>{block.text}</p>}
          {block.type === 'spacer' && <div className='h-3' />}
        </div>
      ))}
    </div>
  )
}
