import React from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, themes } from '@mirohq/design-system';
import { MiroProvider } from '@mirohq/websdk-react-hooks';

import { App } from './app/App';

const lightThemeClassName = createTheme(themes.light);

const container = document.getElementById('root');
if (container) {
  container.classList += lightThemeClassName;
  const root = createRoot(container);
  root.render(
    <MiroProvider>
      <App />
    </MiroProvider>,
  );
}
