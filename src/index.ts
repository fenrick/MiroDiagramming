import { DiagramApp } from './app/diagram-app';
import { log } from './logger';

DiagramApp.getInstance()
  .init()
  .catch((err) => {
    log.error(err);
  });

export {};
