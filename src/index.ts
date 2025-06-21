import { DiagramApp } from './app/DiagramApp';

DiagramApp.getInstance()
  .init()
  .catch(err => {
    // eslint-disable-next-line no-console
    console.error(err);
  });

export {};
