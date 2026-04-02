import { parseDocumentBlocks } from '../../src/shared/lib'

describe('parseDocumentBlocks', () => {
  it('parses markdown headings, list items, and widgets', () => {
    expect(
      parseDocumentBlocks(`# Title

- item
[TASK_WIDGET:task-docs]
[PR_REFERENCE:pr-1]`)
    ).toEqual([
      { type: 'heading-1', text: 'Title' },
      { type: 'spacer', text: '' },
      { type: 'list-item', text: 'item' },
      { type: 'task-widget', entityId: 'task-docs' },
      { type: 'pr-reference', entityId: 'pr-1' }
    ])
  })
})
