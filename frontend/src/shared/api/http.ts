import axios from 'axios'

import { appConfig } from '@/shared/config'

export const http = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})
