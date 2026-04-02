import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Badge, Card } from '@/shared/ui'
import type { KanbanBoardData, KanbanCard, KanbanLane, KanbanLaneId } from '@/widgets/kanban-board/model/kanbanBoard.ts'

type KanbanBoardProps = {
  data: KanbanBoardData
  isStatusUpdating?: boolean
  onTaskStatusChange: (taskId: string, status: KanbanLaneId) => void
}

const priorityBadgeMap: Record<KanbanCard['priority'], 'muted' | 'outline' | 'warning' | 'danger'> = {
  low: 'muted',
  medium: 'outline',
  high: 'warning',
  critical: 'danger'
}

function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
      <div className='grid gap-2'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{label}</p>
        <p className='font-heading text-4xl uppercase leading-[1.02] tracking-[0.03em] text-[color:var(--foreground)]'>{value}</p>
        <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{detail}</p>
      </div>
    </Card>
  )
}

function TaskCardBody({
  card,
  attributes,
  listeners
}: {
  card: KanbanCard
  attributes?: unknown
  listeners?: unknown
}) {
  return (
    <Card
      className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)] transition-transform hover:-translate-y-0.5'
      size='sm'
      theme='secondary'
    >
      <div className='grid gap-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='grid gap-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--muted-foreground)]'>{card.key}</p>
            <Link className='text-lg font-semibold leading-7 text-[color:var(--foreground)] no-underline hover:text-[color:var(--accent)]' to={`/tasks/${card.id}`}>
              {card.title}
            </Link>
          </div>

          <button
            {...((attributes ?? {}) as object)}
            {...((listeners ?? {}) as object)}
            className='inline-flex h-9 w-9 items-center justify-center rounded-[18px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--muted-foreground)] transition-colors hover:border-[color:var(--border-strong)] hover:text-[color:var(--foreground)]'
            type='button'
          >
            ::
          </button>
        </div>

        <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{card.description}</p>

        <div className='flex flex-wrap gap-2'>
          <Badge variant={priorityBadgeMap[card.priority]}>{card.priority}</Badge>
          <Badge variant='outline'>{card.projectKey}</Badge>
          {card.releaseVersion ? <Badge variant='outline'>{card.releaseVersion}</Badge> : null}
          {card.blockerCount > 0 ? <Badge variant='danger'>{card.blockerCount} blockers</Badge> : null}
        </div>

        <div className='grid gap-2 text-sm leading-7 text-[color:var(--muted-foreground)]'>
          <div className='flex items-center justify-between gap-3'>
            <span>Assignee</span>
            <span className='font-medium text-[color:var(--foreground)]'>{card.assigneeName ?? 'Unassigned'}</span>
          </div>
          <div className='flex items-center justify-between gap-3'>
            <span>Due</span>
            <span className='font-medium text-[color:var(--foreground)]'>{card.dueDate ?? 'Not set'}</span>
          </div>
          <div className='flex items-center justify-between gap-3'>
            <span>Context</span>
            <span className='font-medium text-[color:var(--foreground)]'>{card.epochName ?? 'No epoch'}</span>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-2 text-xs text-[color:var(--muted-foreground)]'>
          <div className='rounded-[18px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3 text-center'>
            <p className='font-semibold text-[color:var(--foreground)]'>{card.linkedDocs}</p>
            <p className='mt-1 uppercase tracking-[0.08em]'>Docs</p>
          </div>
          <div className='rounded-[18px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3 text-center'>
            <p className='font-semibold text-[color:var(--foreground)]'>{card.linkedMeetings}</p>
            <p className='mt-1 uppercase tracking-[0.08em]'>Meetings</p>
          </div>
          <div className='rounded-[18px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-3 py-3 text-center'>
            <p className='font-semibold text-[color:var(--foreground)]'>{card.linkedPullRequests}</p>
            <p className='mt-1 uppercase tracking-[0.08em]'>PRs</p>
          </div>
        </div>

        {card.tags.length > 0 ? (
          <div className='flex flex-wrap gap-2'>
            {card.tags.map((tag) => (
              <span key={tag} className='rounded-full border border-[color:var(--border)] bg-[color:var(--secondary)] px-2.5 py-1 text-xs font-medium leading-6 text-[color:var(--muted-foreground)]'>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  )
}

function SortableTaskCard({ card }: { card: KanbanCard }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: {
      status: card.status
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCardBody attributes={attributes} card={card} listeners={listeners} />
    </div>
  )
}

function KanbanColumn({ lane, isStatusUpdating }: { lane: KanbanLane; isStatusUpdating?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: lane.id
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex min-w-0 flex-col gap-4 rounded-[28px] border p-5 transition-colors ${
        isOver
          ? 'border-[color:var(--border-strong)] bg-[color:var(--card-highlight)]'
          : 'border-[color:var(--border)] bg-[rgba(247,245,241,0.75)]'
      }`}
    >
      <div className='grid gap-2'>
        <div className='flex items-center justify-between gap-3'>
          <div className='grid gap-1'>
            <h2 className='font-heading text-2xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{lane.title}</h2>
            <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>{lane.description}</p>
          </div>
          <Badge variant='outline'>{lane.cards.length}</Badge>
        </div>
        {isStatusUpdating ? <p className='text-xs leading-6 text-[color:var(--muted-foreground)]'>Updating task status...</p> : null}
      </div>

      <SortableContext items={lane.cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
        <div className='grid gap-3'>
          {lane.cards.map((card) => (
            <SortableTaskCard key={card.id} card={card} />
          ))}
          {lane.cards.length === 0 ? (
            <div className='rounded-[24px] border border-dashed border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-8 text-center text-sm leading-7 text-[color:var(--muted-foreground)]'>
              Drop a task here to update its status.
            </div>
          ) : null}
        </div>
      </SortableContext>
    </div>
  )
}

export function KanbanBoard({ data, isStatusUpdating, onTaskStatusChange }: KanbanBoardProps) {
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [searchValue, setSearchValue] = useState('')
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const filteredLanes = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    return data.lanes.map((lane) => ({
      ...lane,
      cards: lane.cards.filter((card) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          [card.key, card.title, card.description, card.projectName, ...(card.tags ?? [])].join(' ').toLowerCase().includes(normalizedSearch)
        const matchesProject = projectFilter === 'all' || card.projectKey === projectFilter
        const matchesPriority = priorityFilter === 'all' || card.priority === priorityFilter

        return matchesSearch && matchesProject && matchesPriority
      })
    }))
  }, [data.lanes, priorityFilter, projectFilter, searchValue])

  const allCards = filteredLanes.flatMap((lane) => lane.cards)
  const activeTask = allCards.find((card) => card.id === activeTaskId) ?? data.lanes.flatMap((lane) => lane.cards).find((card) => card.id === activeTaskId)

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null)

    if (!event.over) {
      return
    }

    const taskId = String(event.active.id)
    const overId = String(event.over.id)
    const overLane = filteredLanes.find((lane) => lane.id === overId)

    if (overLane) {
      const sourceTask = data.lanes.flatMap((lane) => lane.cards).find((card) => card.id === taskId)
      if (sourceTask && sourceTask.status !== overLane.id) {
        onTaskStatusChange(taskId, overLane.id)
      }
      return
    }

    const overCard = data.lanes.flatMap((lane) => lane.cards).find((card) => card.id === overId)
    const sourceTask = data.lanes.flatMap((lane) => lane.cards).find((card) => card.id === taskId)

    if (sourceTask && overCard && sourceTask.status !== overCard.status) {
      onTaskStatusChange(taskId, overCard.status)
    }
  }

  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.42)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid max-w-[78ch] gap-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]'>Tasks Slice</p>
              <div className='grid gap-2'>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>Kanban Board</h1>
                <p className='text-sm leading-7 text-[color:var(--muted-foreground)]'>
                  Operational execution with visible task context: docs, meetings, pull requests, releases, sprint links, and blockers all surface
                  directly on the board.
                </p>
              </div>
            </div>

            <div className='rounded-[24px] border border-[color:var(--border)] bg-[rgba(255,255,255,0.38)] px-4 py-3 text-sm leading-7 text-[color:var(--foreground)]'>
              Drag between columns to update delivery state without losing linked context.
            </div>
          </div>

          <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px_180px]'>
            <input
              className='min-h-12 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 text-sm text-[color:var(--foreground)] outline-none transition-colors focus:border-[color:var(--accent)]'
              placeholder='Search by task, key, description, or tag'
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />

            <select
              className='min-h-12 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 text-sm text-[color:var(--foreground)] outline-none'
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
            >
              <option value='all'>All projects</option>
              {data.projects.map((project) => (
                <option key={project.id} value={project.key}>
                  {project.key} {project.name}
                </option>
              ))}
            </select>

            <select
              className='min-h-12 rounded-[22px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 text-sm text-[color:var(--foreground)] outline-none'
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value='all'>All priorities</option>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
              <option value='critical'>Critical</option>
            </select>
          </div>
        </div>
      </Card>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4'>
        {data.summary.map((item) => (
          <StatCard key={item.id} detail={item.detail} label={item.label} value={item.value} />
        ))}
      </section>

      <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
        <section className='grid gap-4 xl:grid-cols-3 2xl:grid-cols-5'>
          {filteredLanes.map((lane) => (
            <KanbanColumn key={lane.id} isStatusUpdating={isStatusUpdating} lane={lane} />
          ))}
        </section>

        <DragOverlay>{activeTask ? <TaskCardBody card={activeTask} /> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}
