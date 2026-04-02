import { parseTemplateConfig } from '../../src/shared/config'

describe('parseTemplateConfig', () => {
  it('applies defaults for an empty source', () => {
    expect(parseTemplateConfig({})).toEqual({
      appName: 'Template Shell',
      appDescription: 'A generic application shell built with React, TypeScript, Vite, and FSD.',
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
