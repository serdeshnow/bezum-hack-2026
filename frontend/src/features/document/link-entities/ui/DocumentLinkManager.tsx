import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { epochQueries } from '@/entities/epoch'
import { meetingQueries } from '@/entities/meeting'
import { releaseQueries } from '@/entities/release'
import { taskQueries } from '@/entities/task'
import { useAddDocumentLink } from '@/entities/document'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import type { LinkedEntity } from '@/shared/mocks/seamless.ts'

type Props = {
  docId: string
  linkedEntities: LinkedEntity[]
}

type LinkOption = LinkedEntity & {
  key: string
}

export function DocumentLinkManager({ docId, linkedEntities }: Props) {
  const addDocumentLink = useAddDocumentLink(docId)
  const { data: tasks = [] } = useQuery(taskQueries.list())
  const { data: meetings = [] } = useQuery(meetingQueries.list())
  const { data: releases } = useQuery(releaseQueries.dashboard())
  const { data: epochs = [] } = useQuery(epochQueries.list())
  const [selectedKey, setSelectedKey] = useState<string>('')

  const options = useMemo<LinkOption[]>(() => {
    const releaseOptions =
      releases?.releases.map((release) => ({
        key: `release:${release.id}`,
        id: release.id,
        type: 'release' as const,
        title: release.version,
        status: release.status
      })) ?? []

    return [
      ...tasks.map((task) => ({
        key: `task:${task.id}`,
        id: task.id,
        type: 'task' as const,
        title: task.title,
        status: task.status
      })),
      ...meetings.map((meeting) => ({
        key: `meeting:${meeting.id}`,
        id: meeting.id,
        type: 'meeting' as const,
        title: meeting.title,
        status: meeting.status
      })),
      ...releaseOptions,
      ...epochs.map((epoch) => ({
        key: `epoch:${epoch.id}`,
        id: epoch.id,
        type: 'epoch' as const,
        title: epoch.title,
        status: epoch.status
      }))
    ].filter((option) => !linkedEntities.some((entity) => entity.type === option.type && entity.id === option.id))
  }, [epochs, linkedEntities, meetings, releases?.releases, tasks])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual linking</CardTitle>
        <CardDescription>Attach tasks, meetings, releases, and epochs directly to this document.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Select value={selectedKey} onValueChange={setSelectedKey}>
          <SelectTrigger>
            <SelectValue placeholder='Select entity to link' />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.type}: {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!selectedKey || addDocumentLink.isPending}
          onClick={() => {
            const entity = options.find((option) => option.key === selectedKey)
            if (!entity) return
            addDocumentLink.mutate(entity)
            setSelectedKey('')
          }}
        >
          Link entity
        </Button>
      </CardContent>
    </Card>
  )
}
