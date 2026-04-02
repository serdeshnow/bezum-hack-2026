import axios from 'axios'

import { appConfig } from '@/shared/config'
import { getApiToken } from './authToken.ts'
import { normalizeApiBaseUrl } from './backend.ts'

export const http = axios.create({
  baseURL: normalizeApiBaseUrl(appConfig.apiBaseUrl),
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  const token = getApiToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})
