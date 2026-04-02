import { useAddTaskComment } from '@/entities/task'

export function useQuoteDocumentSelectionToTask(taskId: string) {
  const addTaskComment = useAddTaskComment(taskId)

  const quoteSelection = (text: string) => {
    const normalizedText = text.trim()
    if (!normalizedText) return

    addTaskComment.mutate(`Quoted from document: "${normalizedText}"`)
  }

  return {
    quoteSelection,
    isPending: addTaskComment.isPending
  }
}
