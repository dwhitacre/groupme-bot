import { Server } from '@hapi/hapi'
import drive from 'drive-db'

import help from './help'
import list from './list'
import ranks from './ranks'
import standings from './standings'
import { GroupMeHook } from '../routes/hooks'

export interface CommandFn {
  (server: Server, tokens: Array<string>, meta?: GroupMeHook): Promise<any>
}

export interface Command {
  run: CommandFn
  desc: string
  usage: string
}

export interface Commands {
  [propName: string]: Command
}

function createCustomCommand(command: string, desc: string, message: string, pictureUrl: string): Command {
  if (command.startsWith('!')) command = command.slice(1)

  return {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async run(server: Server, _: Array<string>): Promise<void> {
      await server.groupme().botPost(message, pictureUrl === '' ? undefined : pictureUrl)
    },
    desc,
    usage: `!${command}`,
  } as Command
}

const groupMeImageRegex = /^https?:\/\/i.groupme.com\/.+/

export default async function get(server: Server): Promise<Commands> {
  const commands: Commands = {
    help,
    list,
    ranks,
    standings,
  }

  try {
    const customCommands: Array<{
      command: string
      desc: string
      message: string
      pictureurl: string
    }> = await drive({
      sheet: process.env.DRIVE_CUSTOM_COMMANDS,
      cache: 30,
    })

    customCommands.forEach(cc => {
      if (
        cc.command.length > 0 && // need command
        cc.desc.length > 0 && // need desc
        (cc.message.length > 0 || cc.pictureurl.length > 0) && // need either message or pictureurl
        (cc.pictureurl.length <= 0 || groupMeImageRegex.test(cc.pictureurl)) // need no pictureurl or looks like pictureurl url
      ) {
        commands[cc.command] = createCustomCommand(cc.command, cc.desc, cc.message, cc.pictureurl)
      }
    })
  } catch (err) {
    server.logger().error(err)
  }

  return commands
}
