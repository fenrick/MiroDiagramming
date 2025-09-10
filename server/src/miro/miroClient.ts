import { Miro } from '@mirohq/miro-api'

import { TokenStorage } from './tokenStorage.js'

let _miro: Miro | undefined

export function getMiro(): Miro {
  if (_miro) return _miro
  const { MIRO_CLIENT_ID, MIRO_CLIENT_SECRET, MIRO_REDIRECT_URL } = process.env
  _miro = new Miro({
    clientId: MIRO_CLIENT_ID,
    clientSecret: MIRO_CLIENT_SECRET,
    redirectUrl: MIRO_REDIRECT_URL,
    storage: new TokenStorage(),
  })
  return _miro
}
