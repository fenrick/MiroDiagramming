/**
 * Configure and re-export Logfire for use throughout the client.
 */
import { configure } from 'logfire';

configure({
  sendToLogfire: import.meta.env.VITE_LOGFIRE_SEND_TO_LOGFIRE === 'true',
  serviceName: import.meta.env.VITE_LOGFIRE_SERVICE_NAME ?? 'miro-frontend',
  console: import.meta.env.DEV ?? true, // enable console in dev
});

export * from 'logfire';
