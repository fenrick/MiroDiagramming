import * as stories from '../src/stories/Tabs.stories'

describe('Tabs stories', () =>
  test('provides parent tab examples', () => {
    expect(stories.Tools).toBeDefined()
    expect(stories.Diagrams).toBeDefined()
  }))
