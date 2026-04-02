export type DocumentShortcodeBlock =
  | { type: 'heading-1'; text: string }
  | { type: 'heading-2'; text: string }
  | { type: 'list-item'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'task-widget'; entityId: string }
  | { type: 'meeting-summary'; entityId: string }
  | { type: 'release-widget'; entityId: string }
  | { type: 'pr-reference'; entityId: string }
  | { type: 'spacer'; text: '' }
