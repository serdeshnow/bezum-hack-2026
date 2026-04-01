import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Providers } from './providers'

import '@/styles/index.css'
import '@/styles/classnames.css'
import '@/styles/normalize.css'
import '@/styles/breakpoints.css'
import '@/styles/variables.css'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

import { templateConfig } from '@/shared/config'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault(templateConfig.timezone)

document.title = templateConfig.appName
document.documentElement.lang = templateConfig.locale
document
  .querySelector('meta[name="description"]')
  ?.setAttribute('content', templateConfig.appDescription)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers />
  </StrictMode>
)
