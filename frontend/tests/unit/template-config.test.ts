import { parseTemplateConfig } from '../../src/shared/config'

describe('parseTemplateConfig', () => {
  it('applies defaults for an empty source', () => {
    expect(parseTemplateConfig({})).toEqual({
      appName: 'Seamless',
      appDescription: 'Unified project operations workspace for docs, tasks, meetings, releases, and shared project context.',
      locale: 'en-US',
      timezone: 'UTC',
      features: {
        auth: false,
        examples: false
      }
    })
  })

  it('parses boolean-like feature flags', () => {
    expect(
      parseTemplateConfig({
        VITE_FEATURE_AUTH: 'true',
        VITE_FEATURE_EXAMPLES: 'true'
      }).features
    ).toEqual({
      auth: true,
      examples: true
    })
  })
})
