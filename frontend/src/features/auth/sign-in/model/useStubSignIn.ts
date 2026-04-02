import { useMutation } from '@tanstack/react-query'

import { sessionService } from '@/entities/session'

export function useStubSignIn() {
  return useMutation({
    mutationFn: ({ email, password, apiToken }: { email: string; password?: string; apiToken?: string }) =>
      sessionService.signIn(email, apiToken, password)
  })
}
