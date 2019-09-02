import { Server } from '@hapi/hapi'

import commands from './'

async function run(server: Server, tokens: Array<string>): Promise<void> {
  if (tokens.length <= 1) {
    await server.groupme().botPost(`Usage:
!<command> [...args]
`)
    await commands.list.run(server, tokens)
    return
  }

  let commandName = tokens[1]
  if (commandName.startsWith('!')) {
    commandName = commandName.slice(1)
  }

  await server.groupme().botPost(`!${commandName} -- ${commands[commandName].desc}

Usage:
${commands[commandName].usage}`)
}

export default {
  desc: 'Display help using commands.',
  usage: '!help [command]',
  run,
}
