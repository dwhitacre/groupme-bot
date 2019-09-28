import { Server } from '@hapi/hapi'

import commands from './commands'
import health from './health'
import home from './home'
import hooks from './hooks'

export default function register(server: Server): void {
  commands(server)
  health(server)
  hooks(server)
  home(server)
}
