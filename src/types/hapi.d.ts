import { Server } from '@hapi/hapi'

import GroupMe from '../util/groupme'

declare module '@hapi/hapi' {
  interface Server {
    groupme(): GroupMe
  }
}
