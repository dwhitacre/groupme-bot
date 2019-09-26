import { Server } from '@hapi/hapi'

import getCommands from './'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function run(server: Server, _: Array<string>): Promise<void> {
  const commands = await getCommands(server)
  const commandsList = Object.keys(commands).sort()

  await server.groupme().botPost(
    `Commands:
${commandsList
  .reduce((acc, curr) => {
    return `${acc}
!${curr} -- ${commands[curr].desc}`
  }, '')
  .slice(1)}`,
  )
}

export default {
  desc: 'List the available commands.',
  usage: '!list',
  run,
}
