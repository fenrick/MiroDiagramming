import { DiagramApp } from './app/diagram-app';

DiagramApp.getInstance()
  .init()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
  });

export {};
