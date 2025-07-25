import { DiagramApp } from "./app/diagram-app";

log.info("Starting application");
DiagramApp.getInstance()
  .init()
  .catch(err => log.error(err));

export {};
