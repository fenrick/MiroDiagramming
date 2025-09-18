import type { Decorator, Preview } from '@storybook/react'
import '@mirohq/design-system-themes/base.css'
import '@mirohq/design-system-themes/light.css'
import '../src/assets/style.css'

/**
 * Custom viewport definitions for Storybook. Miro restricts embedded
 * iframes to 368 px wide so the stories should render within that
 * constraint by default.
 */
export const miroViewports = {
  miro: {
    name: 'Miro 368px',
    styles: { width: '368px', height: '100%' },
    type: 'mobile',
  },
} as const

const darkHref = new URL('@mirohq/design-system-themes/dark.css', import.meta.url).toString()
const darkLink = document.createElement('link')
darkLink.rel = 'stylesheet'
darkLink.href = darkHref

const withTheme: Decorator = (Story, context) => {
  const { theme } = context.globals
  if (theme === 'dark') {
    if (!document.head.querySelector(`link[href="${darkHref}"]`)) {
      document.head.appendChild(darkLink)
    }
  } else {
    document.head.querySelector(`link[href="${darkHref}"]`)?.remove()
  }
  return Story(context)
}

const preview: Preview = {
  decorators: [withTheme],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
    viewport: { defaultViewport: 'miro', viewports: miroViewports },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
}

export default preview
