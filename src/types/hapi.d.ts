import { Server } from '@hapi/hapi'

import GroupMe from '../util/groupme'
import FantasyPros from '../util/fantasypros'

declare module '@hapi/hapi' {
  interface Server {
    groupme(): GroupMe
    fantasypros(): FantasyPros
  }
}
