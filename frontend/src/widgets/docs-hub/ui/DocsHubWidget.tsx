import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { documentQueries, useCreateDocument } from '@/entities/document'
import { epochQueries } from '@/entities/epoch'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  PageState,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@/shared/ui'

export function DocsHubWidget() {
  const navigate = useNavigate()
  const { data: documents = [], isLoading, error } = useQuery(documentQueries.list())
  const { data: folders = [] } = useQuery(documentQueries.folders())
  const { data: epochs = [] } = useQuery(epochQueries.list())
  const createDocument = useCreateDocument()
  const [query, setQuery] = useState('')
  const [selectedEpochId, setSelectedEpochId] = useState<string>('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [draftDescription, setDraftDescription] = useState('')

  const filtered = useMemo(
    () =>
      documents.filter((document) => {
        const matchesQuery = document.title.toLowerCase().includes(query.toLowerCase()) || document.description.toLowerCase().includes(query.toLowerCase())
        const matchesEpoch = selectedEpochId === 'all' || document.epoch?.id === selectedEpochId
        return matchesQuery && matchesEpoch
      }),
    [documents, query, selectedEpochId]
  )

  if (isLoading) {
    return <PageState state='loading' title='Loading docs hub' description='Building document hierarchy and linked entity counts.' />
  }

  if (error) {
    return <PageState state='error' title='Docs hub unavailable' description='Document data could not be loaded.' />
  }

  const handleCreateDocument = () => {
    createDocument.mutate(
      {
        title: draftTitle.trim() || 'Untitled document',
        description: draftDescription.trim() || 'New delivery document'
      },
      {
        onSuccess: (document) => {
          setIsCreateOpen(false)
          setDraftTitle('')
          setDraftDescription('')
          toast.success('Document created')
          navigate(`/docs/${document.id}`)
        },
        onError: (mutationError) => {
          toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to create document')
        }
      }
    )
  }

  if (!documents.length) {
    return (
      <>
        <PageState
          state='empty'
          title='No documents available'
          description='Start by drafting a delivery document or importing an existing brief.'
          action={{ label: 'Create document', onClick: () => setIsCreateOpen(true) }}
        />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create document</DialogTitle>
              <DialogDescription>Create a new document in the currently selected backend project.</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder='Architecture overview' />
              <Textarea
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
                placeholder='What this document is for and who it should help.'
              />
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDocument} disabled={createDocument.isPending}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Docs hub</h1>
          <p className='text-muted-foreground text-sm'>Hierarchical documents with linked tasks, meetings, releases, and approval state.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>New document</Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create document</DialogTitle>
            <DialogDescription>Create a new document in the currently selected backend project.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} placeholder='Architecture overview' />
            <Textarea
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              placeholder='What this document is for and who it should help.'
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDocument} disabled={createDocument.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className='grid gap-4 xl:grid-cols-[280px_1fr]'>
        <Card>
          <CardHeader>
            <CardTitle>Folders</CardTitle>
            <CardDescription>Document hierarchy grouped around delivery contexts.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            {folders.map((folder) => (
              <div key={folder.id} className='rounded-lg border p-3 text-sm'>
                <div className='flex items-center justify-between font-medium'>
                  <span>{folder.name}</span>
                  <Badge variant='secondary'>{folder.docCount}</Badge>
                </div>
                {folder.children?.map((child) => (
                  <div key={child.id} className='text-muted-foreground mt-2 flex items-center justify-between pl-3 text-xs'>
                    <span>{child.name}</span>
                    <span>{child.docCount}</span>
                  </div>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className='space-y-4'>
          <div className='grid gap-3 md:grid-cols-[1fr_220px]'>
            <div className='relative'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className='pl-10' placeholder='Search docs, links, or descriptions' />
            </div>
            <Select value={selectedEpochId} onValueChange={setSelectedEpochId}>
              <SelectTrigger>
                <SelectValue placeholder='Filter by epoch' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All epochs</SelectItem>
                {epochs.map((epoch) => (
                  <SelectItem key={epoch.id} value={epoch.id}>
                    {epoch.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='text-muted-foreground rounded-lg border p-3 text-sm'>
            {filtered.length} documents in scope.
            {selectedEpochId !== 'all' && ` Filtered to ${epochs.find((epoch) => epoch.id === selectedEpochId)?.title ?? 'selected epoch'}.`}
          </div>
          <div className='grid gap-4 md:grid-cols-2'>
            {filtered.map((document) => (
              <Link key={document.id} to={`/docs/${document.id}`}>
                <Card className='hover:border-accent h-full transition-colors'>
                  <CardHeader>
                    <CardDescription>{document.author.name}</CardDescription>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <FileText className='size-4' />
                      {document.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    <p className='text-muted-foreground'>{document.description}</p>
                    <div className='flex flex-wrap gap-2'>
                      <Badge variant='outline'>{document.status}</Badge>
                      <Badge variant='secondary'>{document.accessScope}</Badge>
                      {document.epochLabel && <Badge variant='outline'>{document.epochLabel}</Badge>}
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      Linked: {document.linkedTotal} entities total, including {document.linkedTo.tasks ?? 0} tasks and {document.linkedTo.meetings ?? 0} meetings
                    </p>
                  </CardContent>
                  <CardFooter className='text-muted-foreground text-xs'>{document.lastUpdated}</CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
