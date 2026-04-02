import { useState } from 'react'
import { useNavigate } from 'react-router'

import { appConfig } from '@/shared/config'
import { appRoutes } from '@/shared/model'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/shared/ui'

import { useStubSignIn } from '../model/useStubSignIn.ts'

const quickUsers = [
  { email: 'alex@seamless.dev', label: 'Developer' },
  { email: 'emily@client.dev', label: 'Customer' }
] as const

export function SignInCard() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('sarah@seamless.dev')
  const [password, setPassword] = useState('')
  const [apiToken, setApiToken] = useState('')
  const signIn = useStubSignIn()
  const isMockMode = appConfig.useMockApi

  const submit = (value: string) => {
    signIn.mutate({ email: value, password: password.trim() || undefined, apiToken: apiToken.trim() || undefined }, {
      onSuccess: () => navigate(appRoutes.auth.verify)
    })
  }

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          {isMockMode
            ? 'Dev stub mode is enabled. You can enter a demo email or pass a bearer token manually.'
            : 'Use backend credentials for JWT login. If you already have a token, you can provide it manually.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder='sarah@seamless.dev' />
        {!isMockMode ? (
          <Input type='password' value={password} onChange={(event) => setPassword(event.target.value)} placeholder='Password' />
        ) : null}
        <Input
          type='password'
          value={apiToken}
          onChange={(event) => setApiToken(event.target.value)}
          placeholder='Optional bearer token for backend API'
        />
        <Button className='w-full' onClick={() => submit(email)} disabled={signIn.isPending}>
          Continue
        </Button>
        {signIn.isError ? <p className='text-destructive text-sm'>{signIn.error instanceof Error ? signIn.error.message : 'Sign-in failed.'}</p> : null}
        {isMockMode ? (
          <div className='grid gap-2 sm:grid-cols-2'>
            {quickUsers.map((user) => (
              <Button key={user.email} variant='outline' onClick={() => submit(user.email)} disabled={signIn.isPending}>
                {user.label}
              </Button>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
