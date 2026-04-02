import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Providers } from './providers'

import '@/styles/index.css'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { appConfig } from '@/shared/config'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(appConfig.timezone)

document.title = appConfig.appName
document.documentElement.lang = appConfig.locale
document
  .querySelector('meta[name="description"]')
  ?.setAttribute('content', appConfig.appDescription)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers />
  </StrictMode>
)
