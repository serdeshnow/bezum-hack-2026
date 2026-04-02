import axios from 'axios'

import { appConfig } from '@/shared/config'
import { getApiToken } from './authToken.ts'

export type ApiEntity<T> = T & {
  id: string
  createdAt?: string
  updatedAt?: string
}

export function normalizeApiBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/api`
}

export function canUseBackend() {
  return !appConfig.useMockApi && Boolean(getApiToken())
}

export async function withBackendFallback<T>(apiCall: () => Promise<T>, mockCall: () => T | Promise<T>) {
  if (!canUseBackend()) {
    return await mockCall()
  }

  try {
    return await apiCall()
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return await mockCall()
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return await mockCall()
    }

    if (axios.isAxiosError(error) && !error.response) {
      return await mockCall()
    }

    throw error
  }
}
