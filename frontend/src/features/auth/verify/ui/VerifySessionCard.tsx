import { useNavigate } from 'react-router'

import { appRoutes } from '@/shared/model'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui'

import { useStubVerifySession } from '../model/useStubVerifySession.ts'

export function VerifySessionCard() {
  const navigate = useNavigate()
  const verify = useStubVerifySession()

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Verify sign in</CardTitle>
        <CardDescription>This step confirms the JWT-backed session through `/auth/me` and enters the protected workspace.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-muted-foreground text-sm'>Your session is ready. Continue into the protected workspace.</p>
        <Button
          className='w-full'
          onClick={() =>
            verify.mutate(undefined, {
              onSuccess: () => navigate(appRoutes.projects)
            })
          }
          disabled={verify.isPending}
        >
          Enter workspace
        </Button>
        {verify.isError ? <p className='text-destructive text-sm'>{verify.error instanceof Error ? verify.error.message : 'Verification failed.'}</p> : null}
      </CardContent>
    </Card>
  )
}
