import { Server } from '@hapi/hapi'

import health from './health'
import hooks from './hooks'

export default function register(server: Server): void {
  health(server)
  hooks(server)
}
