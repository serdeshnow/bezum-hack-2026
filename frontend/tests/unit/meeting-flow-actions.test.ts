import { applyMeetingSummaryToDocument, createTaskFromMeetingActionItem, getDocumentEditor, getDocumentHistory, listTasks } from '../../src/shared/mocks/seamless.ts'

describe('meeting action-item and document application flows', () => {
  it('creates a task from an action item and applies a recap to a document review context', () => {
    const initialTaskCount = listTasks().length

    const updatedRecap = createTaskFromMeetingActionItem('meeting-review', 'action-2')
    expect(updatedRecap).toBeDefined()
    const createdActionItem = updatedRecap?.actionItems.find((item) => item.id === 'action-2')

    expect(createdActionItem?.alreadyTask).toBe(true)
    expect(createdActionItem?.taskId).toBeTruthy()
    expect(listTasks()).toHaveLength(initialTaskCount + 1)

    const appliedRecap = applyMeetingSummaryToDocument('meeting-review', 'doc-architecture', 'review', 'user-manager')
    const linkedDocument = appliedRecap?.linkedDocuments.find((document) => document.id === 'doc-architecture')
    const editor = getDocumentEditor('doc-architecture')
    const history = getDocumentHistory('doc-architecture')

    expect(linkedDocument?.applied).toBe(true)
    expect(linkedDocument?.reviewRequested).toBe(true)
    expect(editor.awaitingApproval).toBe(true)
    expect(editor.content).toContain('## Meeting Summary: Architecture Review')
    expect(history[0]?.changeSource).toBe('meeting')
    expect(history[0]?.status).toBe('pending-approval')
  })
})
