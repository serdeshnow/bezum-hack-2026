import { DocumentStatus } from '../../src/shared/api'
import { adaptDocumentEditorViewModel } from '../../src/entities/document'
import { parseDocumentShortcodes } from '../../src/features/document/shortcodes'

describe('document flow adapters', () => {
  it('derives parsed blocks and quote target task from linked entities', () => {
    const viewModel = adaptDocumentEditorViewModel({
      id: 'doc-1',
      title: 'Architecture',
      version: '1.0',
      status: DocumentStatus.Draft,
      awaitingApproval: false,
      owners: [],
      approvers: [],
      content: '# Title\n[TASK_WIDGET:task-docs]',
      linkedEntities: [
        { id: 'task-docs', type: 'task', title: 'Docs task' },
        { id: 'meeting-review', type: 'meeting', title: 'Review' }
      ],
      comments: []
    })

    expect(viewModel.quoteTargetTaskId).toBe('task-docs')
    expect(viewModel.linkedEntitySummary.tasks).toBe(1)
    expect(parseDocumentShortcodes('# Title\n[TASK_WIDGET:task-docs]')[1]).toEqual({ type: 'task-widget', entityId: 'task-docs' })
  })
})
