import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { Badge, Card } from '@/shared/ui'
import type { DocumentHistoryData } from '@/widgets/document-history/model/documentHistory.ts'

type DocumentHistoryProps = {
  data: DocumentHistoryData
}

function statusVariant(status: string) {
  if (status === 'approved') return 'success'
  if (status === 'pending-approval') return 'warning'
  if (status === 'rejected' || status === 'requested-changes') return 'danger'
  return 'outline'
}

export function DocumentHistory({ data }: DocumentHistoryProps) {
  const [selectedVersionId, setSelectedVersionId] = useState<string>(data.currentVersionId)
  const selectedVersion = useMemo(() => data.versions.find((entry) => entry.id === selectedVersionId) ?? data.versions[0], [data.versions, selectedVersionId])

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.24)_100%)]' theme='secondary'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Document History</p>
            <h1 className='mt-1 font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Version and Approval History</h1>
            <p className='mt-3 max-w-[80ch] text-sm leading-7 text-[color:var(--muted-foreground)]'>
              Review document evolution, approval rationale, and the change sources that shaped the current version.
            </p>
          </div>

          <Link
            className='inline-flex min-h-12 items-center justify-center rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 text-sm font-medium text-[color:var(--foreground)] no-underline transition-colors hover:border-[color:var(--border-strong)]'
            to={`/docs/${data.documentId}`}
          >
            Back To Editor
          </Link>
        </div>
      </Card>

      <div className='grid gap-6 2xl:grid-cols-[340px_minmax(0,1fr)]'>
        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Timeline</p>
              <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Versions</h2>
            </div>

            <div className='grid gap-3'>
              {data.versions.map((version) => (
                <button
                  key={version.id}
                  className={`rounded-[28px] border px-4 py-4 text-left transition-colors ${
                    selectedVersionId === version.id
                      ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)]'
                      : 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)] hover:border-[color:var(--border-strong)]'
                  }`}
                  type='button'
                  onClick={() => setSelectedVersionId(version.id)}
                >
                  <div className='grid gap-3'>
                    <div className='flex items-center justify-between gap-3'>
                      <div>
                        <p className='font-semibold leading-7'>v{version.versionLabel}</p>
                        <p className={`mt-1 text-sm leading-6 ${selectedVersionId === version.id ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>{version.createdAt}</p>
                      </div>
                      <Badge variant={statusVariant(version.status) as 'success' | 'warning' | 'danger' | 'outline'}>{version.status}</Badge>
                    </div>

                    <div className={`flex flex-wrap gap-2 text-xs uppercase tracking-[0.08em] ${selectedVersionId === version.id ? 'text-[rgba(242,240,235,0.78)]' : 'text-[color:var(--muted-foreground)]'}`}>
                      <span>{version.authorName}</span>
                      <span>{version.changeSource}</span>
                    </div>

                    <div className='flex gap-2 text-sm'>
                      <span className={selectedVersionId === version.id ? 'text-emerald-300' : 'text-emerald-700'}>+{version.additions}</span>
                      <span className={selectedVersionId === version.id ? 'text-rose-300' : 'text-rose-700'}>-{version.deletions}</span>
                      <span className={selectedVersionId === version.id ? 'text-amber-300' : 'text-amber-700'}>~{version.modifications}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className='grid gap-6'>
          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Selected Version</p>
                  <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>v{selectedVersion.versionLabel}</h2>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='outline'>{selectedVersion.changeSource}</Badge>
                  {selectedVersion.sourceDetail ? <Badge variant='outline'>{selectedVersion.sourceDetail}</Badge> : null}
                  <Badge variant={statusVariant(selectedVersion.status) as 'success' | 'warning' | 'danger' | 'outline'}>{selectedVersion.status}</Badge>
                </div>
              </div>

              <div className='grid gap-3 md:grid-cols-3'>
                <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                  <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Author</p>
                  <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedVersion.authorName}</p>
                </div>
                <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                  <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Created</p>
                  <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>{selectedVersion.createdAt}</p>
                </div>
                <div className='rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                  <p className='text-xs uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>Change Volume</p>
                  <p className='mt-1.5 font-medium leading-7 text-[color:var(--foreground)]'>
                    +{selectedVersion.additions} / -{selectedVersion.deletions} / ~{selectedVersion.modifications}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Approval Matrix</p>
                <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Reviewer decisions</h2>
              </div>

              <div className='grid gap-3'>
                {selectedVersion.approvals.map((approval, index) => (
                  <div key={`${approval.approverName}-${index}`} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <span className='flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs font-semibold text-[color:var(--primary-foreground)]'>
                          {approval.approverInitials}
                        </span>
                        <div>
                          <p className='font-medium leading-7 text-[color:var(--foreground)]'>{approval.approverName}</p>
                          <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>{approval.decidedAt ?? 'No decision timestamp yet'}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant(approval.status) as 'success' | 'warning' | 'danger' | 'outline'}>{approval.status}</Badge>
                    </div>
                    {approval.rationale ? <p className='mt-3 text-sm leading-7 text-[color:var(--foreground)]'>{approval.rationale}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className='grid gap-6 2xl:grid-cols-2'>
            <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
              <div className='grid gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Diff</p>
                  <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Before</h2>
                </div>
                <pre className='overflow-auto rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] p-4 text-sm leading-7 text-[color:var(--foreground)] whitespace-pre-wrap'>
                  <code>{data.diff.beforeContent || 'No previous version to compare.'}</code>
                </pre>
              </div>
            </Card>

            <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
              <div className='grid gap-4'>
                <div>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Diff</p>
                  <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>After</h2>
                </div>
                <pre className='overflow-auto rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] p-4 text-sm leading-7 text-[color:var(--foreground)] whitespace-pre-wrap'>
                  <code>{data.diff.afterContent}</code>
                </pre>
              </div>
            </Card>
          </div>

          <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-4'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Decision Log</p>
                <h2 className='mt-1 font-heading text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Approval rationale over time</h2>
              </div>

              <div className='grid gap-3'>
                {data.decisions.map((decision) => (
                  <div key={decision.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <div className='flex items-center gap-3'>
                        <span className='flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary)] text-xs font-semibold text-[color:var(--primary-foreground)]'>
                          {decision.approverInitials}
                        </span>
                        <div>
                          <p className='font-medium leading-7 text-[color:var(--foreground)]'>{decision.approverName}</p>
                          <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>v{decision.versionLabel}</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant(decision.decision) as 'success' | 'warning' | 'danger' | 'outline'}>{decision.decision}</Badge>
                    </div>
                    <p className='mt-3 text-sm leading-7 text-[color:var(--foreground)]'>{decision.rationale ?? 'No rationale provided.'}</p>
                    <p className='mt-3 text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--muted-foreground)]'>{decision.decidedAt ?? 'Pending'}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
