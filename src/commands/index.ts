import { Server } from '@hapi/hapi'

import help from './help'
import list from './list'
import rosters from './rosters'
import rules from './rules'
import { GroupMeHook } from '../routes/hooks'

export interface CommandFn {
  (server: Server, tokens: Array<string>, meta?: GroupMeHook): Promise<any>
}

export interface Commands {
  [propName: string]: {
    run: CommandFn
    desc: string
    usage: string
  }
}

const commands: Commands = {
  help,
  list,
  rosters,
  rules,
}

export default commands
