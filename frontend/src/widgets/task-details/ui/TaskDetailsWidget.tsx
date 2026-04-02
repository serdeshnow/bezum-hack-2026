import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar, FileText, GitPullRequest, MessageSquare, Rocket, Video } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { TaskStatus } from '@/shared/api'
import { taskQueries, useAddTaskComment, useUpdateTaskStatus } from '@/entities/task'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageState, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/shared/ui'

export function TaskDetailsWidget() {
  const { taskId = 'task-auth' } = useParams()
  const { data, isLoading, error } = useQuery(taskQueries.detail(taskId))
  const updateStatus = useUpdateTaskStatus(taskId)
  const addComment = useAddTaskComment(taskId)
  const [comment, setComment] = useState('')

  if (isLoading) {
    return <PageState state='loading' title='Loading task details' description='Collecting linked docs, PRs, meetings, and release context.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Task unavailable' description='The selected task could not be loaded.' />
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-muted-foreground text-sm'>{data.key}</p>
          <h1 className='text-2xl font-semibold'>{data.title}</h1>
          <p className='text-muted-foreground mt-2 max-w-3xl text-sm'>{data.description}</p>
        </div>
        <div className='flex flex-col gap-2'>
          <Badge>{data.priority}</Badge>
          <Select value={data.status} onValueChange={(value) => updateStatus.mutate(value as TaskStatus)}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TaskStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='grid gap-4 xl:grid-cols-[2fr_1fr]'>
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Linked context</CardTitle>
              <CardDescription>Task is enriched with direct references to docs, meetings, PRs, and releases.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {data.linkedDocs.map((doc) => (
                <Link key={doc.id} to={`/docs/${doc.id}`} className='bg-muted block rounded-lg p-4'>
                  <div className='flex items-center gap-2 font-medium'><FileText className='size-4' /> {doc.title}</div>
                  <p className='text-muted-foreground mt-2 text-sm'>{doc.preview}</p>
                  {doc.quotes.map((quote) => (
                    <blockquote key={`${doc.id}-${quote.text}`} className='border-accent mt-3 border-l-2 pl-3 text-sm'>
                      “{quote.text}”
                    </blockquote>
                  ))}
                </Link>
              ))}

              {data.linkedMeetings.map((meeting) => (
                <Link key={meeting.id} to={`/meetings/${meeting.id}`} className='bg-muted block rounded-lg p-4'>
                  <div className='flex items-center gap-2 font-medium'><Video className='size-4' /> {meeting.title}</div>
                  <p className='text-muted-foreground mt-2 text-sm'>{meeting.summary}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discussion</CardTitle>
              <CardDescription>Quoted document changes and automation notes should land here.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder='Add comment or quote from linked document…' />
              <Button
                onClick={() => {
                  if (!comment.trim()) return
                  addComment.mutate(comment.trim())
                  setComment('')
                }}
              >
                <MessageSquare className='size-4' />
                Post comment
              </Button>

              <div className='space-y-3'>
                {data.comments.map((item) => (
                  <div key={item.id} className='rounded-lg border p-4'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='font-medium'>{item.user.name}</span>
                      <span className='text-muted-foreground'>{item.timestamp}</span>
                    </div>
                    <p className='mt-2 text-sm'>{item.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Delivery links</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              {data.linkedPRs.map((pr) => (
                <div key={pr.id} className='rounded-lg border p-3'>
                  <div className='flex items-center gap-2 font-medium'><GitPullRequest className='size-4' /> #{pr.number} {pr.title}</div>
                  <p className='text-muted-foreground mt-1'>{pr.branch}</p>
                </div>
              ))}
              {data.linkedRelease && (
                <div className='rounded-lg border p-3'>
                  <div className='flex items-center gap-2 font-medium'><Rocket className='size-4' /> {data.linkedRelease.version}</div>
                  <p className='text-muted-foreground mt-1 capitalize'>{data.linkedRelease.status}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <p><span className='text-muted-foreground'>Assignee:</span> {data.assignee?.name}</p>
              <p><span className='text-muted-foreground'>Reporter:</span> {data.reporter?.name}</p>
              <p className='flex items-center gap-2'><Calendar className='size-4 text-muted-foreground' /> {data.dueDate}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
