import { expect, test } from '@playwright/test'

test('generic shell renders and optional routes stay disabled by default', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Template Shell' })).toBeVisible()

  await page.goto('/auth/sign-in')
  await expect(page.getByRole('heading', { name: '404: Page not found' })).toBeVisible()

  await page.goto('/examples/grass-admin')
  await expect(page.getByRole('heading', { name: '404: Page not found' })).toBeVisible()
})
