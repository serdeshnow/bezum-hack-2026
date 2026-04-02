import { useMutation } from '@tanstack/react-query'

import { sessionService } from '@/entities/session'

export function useStubSignIn() {
  return useMutation({
    mutationFn: (email: string) => sessionService.signIn(email)
  })
}
