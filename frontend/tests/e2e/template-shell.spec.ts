import { expect, test } from '@playwright/test'

test('seamless shell renders and retired template routes stay disabled', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Projects Hub' })).toBeVisible()

  await page.goto('/auth/sign-in')
  await expect(page.getByRole('heading', { name: '404: Page not found' })).toBeVisible()

  await page.goto('/examples/grass-admin')
  await expect(page.getByRole('heading', { name: '404: Page not found' })).toBeVisible()
})

test('demo flow routes stay connected across the product graph', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Projects Hub' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'End-to-end walkthrough' })).toBeVisible()

  await page.goto('/projects/project-1')
  await expect(page.getByRole('heading', { name: 'Atlas Commerce' })).toBeVisible()

  await page.goto('/tasks/task-1')
  await expect(page.getByRole('heading', { name: 'Implement payment session orchestration' })).toBeVisible()

  await page.goto('/docs/doc-1')
  await expect(page.getByRole('heading', { name: 'Checkout Architecture Overview' }).first()).toBeVisible()

  await page.goto('/meetings/meeting-1')
  await expect(page.getByRole('heading', { name: 'Meeting Recap' })).toBeVisible()

  await page.goto('/releases')
  await expect(page.getByRole('heading', { name: 'Releases and Pull Requests' })).toBeVisible()

  await page.goto('/notifications')
  await expect(page.getByRole('heading', { name: 'Unified Inbox' })).toBeVisible()
})
