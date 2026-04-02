import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Search } from 'lucide-react'
import { Link } from 'react-router'

import { documentQueries } from '@/entities/document'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, PageState } from '@/shared/ui'

export function DocsHubWidget() {
  const { data: documents = [], isLoading, error } = useQuery(documentQueries.list())
  const { data: folders = [] } = useQuery(documentQueries.folders())
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => documents.filter((document) => document.title.toLowerCase().includes(query.toLowerCase()) || document.description.toLowerCase().includes(query.toLowerCase())),
    [documents, query]
  )

  if (isLoading) {
    return <PageState state='loading' title='Loading docs hub' description='Building document hierarchy and linked entity counts.' />
  }

  if (error) {
    return <PageState state='error' title='Docs hub unavailable' description='Document data could not be loaded.' />
  }

  if (!documents.length) {
    return <PageState state='empty' title='No documents available' description='Start by drafting a delivery document or importing an existing brief.' />
  }

  return (
    <section className='space-y-6'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>Docs hub</h1>
          <p className='text-muted-foreground text-sm'>Hierarchical documents with linked tasks, meetings, releases, and approval state.</p>
        </div>
        <Button>New document</Button>
      </div>

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
          <div className='relative'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className='pl-10' placeholder='Search docs, links, or descriptions' />
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
                    </div>
                    <p className='text-muted-foreground text-xs'>
                      Linked: {document.linkedTo.tasks ?? 0} tasks, {document.linkedTo.meetings ?? 0} meetings
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
