import { useMutation } from '@tanstack/react-query'

import { sessionService } from '@/entities/session'

export function useStubVerifySession() {
  return useMutation({
    mutationFn: () => sessionService.verify()
  })
}
