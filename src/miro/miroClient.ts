import { Miro } from '@mirohq/miro-api'

import { TokenStorage } from './tokenStorage.js'
import { loadEnv } from '../config/env.js'

let _miro: Miro | undefined

export function getMiro(): Miro {
  if (_miro) return _miro
  const { MIRO_CLIENT_ID, MIRO_CLIENT_SECRET, MIRO_REDIRECT_URL } = loadEnv()
  if (!MIRO_CLIENT_ID || !MIRO_CLIENT_SECRET || !MIRO_REDIRECT_URL) {
    throw new Error('Miro OAuth env not configured (MIRO_CLIENT_ID/SECRET/REDIRECT_URL)')
  }
  _miro = new Miro({
    clientId: MIRO_CLIENT_ID,
    clientSecret: MIRO_CLIENT_SECRET,
    redirectUrl: MIRO_REDIRECT_URL,
    storage: new TokenStorage(),
  })
  return _miro
}
