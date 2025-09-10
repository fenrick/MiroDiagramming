import { expectTypeOf, test } from 'vitest'

import { AuthClient } from '../src/user-auth'
import type { UserInfo } from '../src/generated/user-info'

test('AuthClient.register uses generated UserInfo type', () => {
  const client = new AuthClient()
  expectTypeOf(client.register).parameter(0).toEqualTypeOf<UserInfo>()
})
