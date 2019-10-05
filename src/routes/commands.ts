import { Server } from '@hapi/hapi'

import getCommands from '../commands'

export default function register(server: Server): void {
  server.route({
    method: 'GET',
    path: '/commands',
    options: {
      handler: async (): Promise<{
        [propName: string]: {
          desc: string
          usage: string
          command: string
        }
      }> => {
        const commands = await getCommands(server)
        const commandsFiltered: {
          [propName: string]: {
            desc: string
            usage: string
            command: string
            enabled: boolean
            hidden: boolean
          }
        } = {}

        for (const commandName in commands) {
          if (commands.hasOwnProperty(commandName)) {
            commandsFiltered[commandName] = {
              desc: commands[commandName].desc,
              usage: commands[commandName].usage,
              command: commandName,
              enabled: commands[commandName].enabled,
              hidden: commands[commandName].hidden,
            }
          }
        }

        return commandsFiltered
      },
      description: 'The commands in the bot.',
      notes: 'GET the commands in the bot.',
      tags: ['api', 'commands'],
    },
  })
}
