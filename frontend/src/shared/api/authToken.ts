import { appConfig } from '@/shared/config'

const apiTokenStorageKey = 'seamless-api-token'

function getLocalStorage() {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function getStoredApiToken() {
  return getLocalStorage()?.getItem(apiTokenStorageKey) ?? null
}

export function getApiToken() {
  return getStoredApiToken() || appConfig.apiToken || null
}

export function setStoredApiToken(token: string) {
  getLocalStorage()?.setItem(apiTokenStorageKey, token)
}

export function clearStoredApiToken() {
  getLocalStorage()?.removeItem(apiTokenStorageKey)
}
