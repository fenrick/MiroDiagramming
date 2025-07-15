import { DiagramApp } from './app/diagram-app';
import { log } from './logger';

log.info('Starting application');
DiagramApp.getInstance()
  .init()
  .catch((err) => {
    log.error(err);
  });

export {};
