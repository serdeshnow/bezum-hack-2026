import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card } from '@/shared/ui'
import type { DocsHubData } from '@/widgets/docs-hub/model/docsHub.ts'

type DocsHubProps = {
  data: DocsHubData
}

export function DocsHub({ data }: DocsHubProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all')
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [scopeFilter, setScopeFilter] = useState<string>('all')
  const [awaitingOnly, setAwaitingOnly] = useState(false)

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return data.documents.filter((document) => {
      const matchesFolder = selectedFolderId === 'all' || document.folderId === selectedFolderId
      const matchesStatus = statusFilter === 'all' || document.status === statusFilter
      const matchesScope = scopeFilter === 'all' || document.accessScope === scopeFilter
      const matchesAwaiting = !awaitingOnly || document.awaitingApproval
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [document.title, document.description, document.authorName, document.projectKey].join(' ').toLowerCase().includes(normalizedSearch)

      return matchesFolder && matchesStatus && matchesScope && matchesAwaiting && matchesSearch
    })
  }, [awaitingOnly, data.documents, scopeFilter, searchValue, selectedFolderId, statusFilter])

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.42)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid max-w-[80ch] gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]'>Docs Slice</p>
              <div className='grid gap-2'>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Documentation Hub</h1>
                <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  Browse documentation by folder, visibility, approval state, and linked product context. This is the main discovery surface for
                  the document graph inside the service.
                </p>
              </div>
            </div>

            <div className='rounded-[24px] border border-[color:var(--border)] bg-[rgba(255,255,255,0.38)] px-4 py-3 text-sm leading-7 text-[color:var(--foreground)]'>
              Folders, versions, approvals, and entity links stay visible in one workspace.
            </div>
          </div>

          <div className='grid gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_160px_180px_auto]'>
            <input
              className='ui-control'
              placeholder='Search docs by title, description, author, or project'
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />

            <select
              className='ui-control'
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value='all'>All status</option>
              <option value='draft'>Draft</option>
              <option value='in-review'>In Review</option>
              <option value='approved'>Approved</option>
              <option value='obsolete'>Obsolete</option>
              <option value='rejected'>Rejected</option>
            </select>

            <select
              className='ui-control'
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
            >
              <option value='all'>All scopes</option>
              <option value='customer'>Customer</option>
              <option value='manager'>Manager</option>
              <option value='dev'>Developer</option>
              <option value='internal'>Internal</option>
            </select>

            <button
              className={`ui-btn ${awaitingOnly ? 'ui-btn-primary' : 'ui-btn-secondary'}`}
              type='button'
              onClick={() => setAwaitingOnly((value) => !value)}
            >
              Awaiting Approval
            </button>
          </div>
        </div>
      </Card>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4'>
        {data.summary.map((item) => (
          <Card key={item.id} className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{item.label}</p>
              <p className='font-heading text-4xl uppercase leading-[1.02] tracking-[0.03em] text-[color:var(--foreground)]'>{item.value}</p>
              <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{item.detail}</p>
            </div>
          </Card>
        ))}
      </section>

      <div className='grid gap-6 2xl:grid-cols-[280px_minmax(0,1fr)]'>
        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Folders</p>
              <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Document tree</h2>
            </div>

            <div className='grid gap-2'>
              {data.folders.map((folder) => (
                <button
                  key={folder.id}
                  className={`flex items-center justify-between rounded-[24px] border px-4 py-4 text-left transition-colors ${
                    selectedFolderId === folder.id
                      ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                      : 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]'
                  }`}
                  type='button'
                  onClick={() => setSelectedFolderId(folder.id)}
                >
                  <div>
                    <p className='text-sm font-medium leading-7'>{folder.name}</p>
                    <p className={`mt-1 text-xs uppercase tracking-[0.08em] ${selectedFolderId === folder.id ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>
                      {folder.projectKey}
                    </p>
                  </div>
                  <span className='text-sm font-semibold'>{folder.count}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Documents</p>
                <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{filteredDocuments.length} results</h2>
              </div>
              <Link
                className='ui-btn ui-btn-primary'
                to='/docs/doc-2'
              >
                Open Featured Doc
              </Link>
            </div>

            <div className='grid gap-3'>
              {filteredDocuments.map((document) => (
                <Link
                  key={document.id}
                  className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-5 py-5 text-inherit no-underline transition-colors hover:border-[color:var(--border-strong)] hover:bg-[color:var(--card-highlight)]'
                  to={`/docs/${document.id}`}
                >
                  <div className='grid gap-4'>
                    <div className='flex flex-wrap items-start justify-between gap-3'>
                      <div className='grid gap-2'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <p className='text-lg font-semibold leading-7 text-[color:var(--foreground)]'>{document.title}</p>
                          {document.isStarred ? <Badge variant='warning'>starred</Badge> : null}
                        </div>
                        <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{document.description}</p>
                      </div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge variant='outline'>{document.projectKey}</Badge>
                        <Badge variant={document.status === 'approved' ? 'success' : document.status === 'in-review' ? 'warning' : document.status === 'rejected' ? 'danger' : 'muted'}>
                          {document.status}
                        </Badge>
                        <Badge variant='outline'>{document.accessScope}</Badge>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-3 text-sm leading-7 text-[color:var(--muted-foreground)]'>
                      <span>{document.authorName}</span>
                      <span>{document.updatedAt}</span>
                      {document.awaitingApproval ? <Badge variant='warning'>awaiting approval</Badge> : null}
                    </div>

                    <div className='flex flex-wrap gap-2'>
                      {document.linkedCounts.epochs > 0 ? <Badge variant='outline'>{document.linkedCounts.epochs} epochs</Badge> : null}
                      {document.linkedCounts.tasks > 0 ? <Badge variant='outline'>{document.linkedCounts.tasks} tasks</Badge> : null}
                      {document.linkedCounts.meetings > 0 ? <Badge variant='outline'>{document.linkedCounts.meetings} meetings</Badge> : null}
                      {document.linkedCounts.releases > 0 ? <Badge variant='outline'>{document.linkedCounts.releases} releases</Badge> : null}
                      {document.linkedCounts.projects > 0 ? <Badge variant='outline'>{document.linkedCounts.projects} projects</Badge> : null}
                    </div>
                  </div>
                </Link>
              ))}

              {filteredDocuments.length === 0 ? (
                <div className='rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-10 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  No documents match the current filters.
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
