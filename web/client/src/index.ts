import { DiagramApp } from './app/diagram-app';
import { apiFetch } from './core/utils/api-fetch';
import { log } from './logger';
import { registerWithCurrentUser } from './user-auth';

async function start(): Promise<void> {
  log.info('Starting application');
  await registerWithCurrentUser();
  const status = await apiFetch('/api/auth/status');
  if (status.status === 404) {
    const user = await miro.board.getUserInfo();
    await miro.board.ui.openPanel({ url: `/oauth/login?userId=${user.id}` });
  }
  await DiagramApp.getInstance().init();
}

start().catch(err => log.error(err));

export {};
