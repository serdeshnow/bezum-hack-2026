import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Send } from 'lucide-react'
import { useParams } from 'react-router'

import { documentQueries, useAddDocumentComment, useUpdateDocument } from '@/entities/document'
import { DocumentLinkManager } from '@/features/document/link-entities'
import { useQuoteDocumentSelectionToTask } from '@/features/document/quote'
import { DocumentReviewActions } from '@/features/document/review-version'
import { DocumentShortcodePreview, parseDocumentShortcodes } from '@/features/document/shortcodes'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@/shared/ui'

export function DocumentEditorWidget() {
  const { docId = 'doc-architecture' } = useParams()
  const { data, isLoading, error } = useQuery(documentQueries.detail(docId))
  const updateDocument = useUpdateDocument(docId)
  const addComment = useAddDocumentComment(docId)
  const { quoteSelection, isPending: quotePending } = useQuoteDocumentSelectionToTask(data?.quoteTargetTaskId ?? 'task-docs')
  const [content, setContent] = useState('')
  const [comment, setComment] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (data) {
      setContent(data.content)
    }
  }, [data])

  if (isLoading) {
    return <PageState state='loading' title='Loading document editor' description='Resolving content, approvals, and linked delivery entities.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Document unavailable' description='The selected document could not be loaded.' />
  }

  const parsedBlocks = parseDocumentShortcodes(content)

  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>{data.title}</h1>
          <p className='text-muted-foreground text-sm'>Markdown editor with inline widgets for task, meeting, release, and PR context.</p>
        </div>
        <Button onClick={() => updateDocument.mutate(content)}>Save version {data.version}</Button>
      </div>

      <div className='grid gap-4 xl:grid-cols-[2fr_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
            <CardDescription>Select text and send it back into a linked task discussion.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Tabs defaultValue='write'>
              <TabsList>
                <TabsTrigger value='write'>Write</TabsTrigger>
                <TabsTrigger value='preview'>Preview</TabsTrigger>
              </TabsList>
              <TabsContent value='write' className='space-y-4'>
                <Textarea ref={textareaRef} value={content} onChange={(event) => setContent(event.target.value)} className='min-h-[480px] font-mono' />
                <div className='flex flex-wrap gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      const target = textareaRef.current
                      if (!target) return
                      const text = target.value.slice(target.selectionStart, target.selectionEnd).trim()
                      if (!text) return
                      quoteSelection(text)
                    }}
                    disabled={quotePending}
                  >
                    <CheckSquare className='size-4' />
                    Quote selection to linked task
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value='preview'>
                <DocumentShortcodePreview blocks={parsedBlocks} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Linked entities</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='text-muted-foreground rounded-lg border p-3 text-xs'>
                {data.linkedEntitySummary.total} total links: {data.linkedEntitySummary.tasks} tasks, {data.linkedEntitySummary.meetings} meetings, {data.linkedEntitySummary.releases} releases
              </div>
              {data.linkedEntities.map((entity) => (
                <div key={`${entity.type}-${entity.id}`} className='rounded-lg border p-3'>
                  <p className='font-medium capitalize'>{entity.type}</p>
                  <p className='text-muted-foreground'>{entity.title}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <DocumentLinkManager docId={docId} linkedEntities={data.linkedEntities} />

          <DocumentReviewActions docId={docId} awaitingApproval={data.status === 'in-review'} />

          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder='Comment on current draft…' />
              <Button
                onClick={() => {
                  if (!comment.trim()) return
                  addComment.mutate(comment.trim())
                  setComment('')
                }}
              >
                <Send className='size-4' />
                Add comment
              </Button>
              {data.comments.map((item) => (
                <div key={item.id} className='rounded-lg border p-3 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{item.author.name}</span>
                    <span className='text-muted-foreground'>{item.timestamp}</span>
                  </div>
                  <p className='mt-2'>{item.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
