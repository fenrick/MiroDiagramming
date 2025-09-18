# Frontend Build

This project is frontend‑only. The Vite build outputs a static bundle that runs entirely inside Miro via the Web SDK.

Common commands:

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server
npm run build        # production build (outputs to dist/)
npm run preview      # serve the built bundle locally
```

There is no API client generation step and no dependency on a running backend.
