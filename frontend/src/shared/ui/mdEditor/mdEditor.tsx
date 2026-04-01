import React from 'react'
import MDEditor from '@uiw/react-md-editor'

type Props = {
  initialValue?: string
}

export function SeamlessDocumentEditor({ initialValue = '' }: Props) {
  const [value, setValue] = React.useState(initialValue)
  const [saving, setSaving] = React.useState(false)

  const saveDocument = async () => {
    try {
      setSaving(true)

      await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New document',
          contentFormat: 'markdown',
          content: value
        })
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div data-color-mode='light' style={{ display: 'grid', gap: 16 }}>
      <MDEditor
        value={value}
        onChange={(val) => setValue(val || '')}
        preview='edit'
        height={500}
        textareaProps={{
          style: {
            fontFamily: 'monospace',
            lineHeight: 1.5,
            letterSpacing: 'normal',
            fontKerning: 'none'
          }
        }}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={saveDocument} disabled={saving}>
          {saving ? 'Сохраняем...' : 'Сохранить'}
        </button>
      </div>

      <div>
        <h3>Предпросмотр</h3>
        <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} />
      </div>
    </div>
  )
}
