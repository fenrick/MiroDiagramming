import type { Decorator, Preview } from '@storybook/react';
import '@mirohq/design-system-themes/base.css';
import '@mirohq/design-system-themes/light.css';

const darkHref = new URL(
  '@mirohq/design-system-themes/dark.css',
  import.meta.url,
).toString();
const darkLink = document.createElement('link');
darkLink.rel = 'stylesheet';
darkLink.href = darkHref;

const withTheme: Decorator = (Story, context) => {
  const { theme } = context.globals;
  if (theme === 'dark') {
    if (!document.head.querySelector(`link[href="${darkHref}"]`)) {
      document.head.appendChild(darkLink);
    }
  } else {
    document.head.querySelector(`link[href="${darkHref}"]`)?.remove();
  }
  return Story(context);
};

const preview: Preview = {
  decorators: [withTheme],
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: { expanded: true },
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
};

export default preview;
