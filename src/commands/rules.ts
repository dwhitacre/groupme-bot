import { Server } from '@hapi/hapi'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function run(server: Server, _: Array<string>): Promise<void> {
  if (process.env.FF_RULES) {
    await server.groupme().botPost(process.env.FF_RULES)
  } else {
    await server.groupme().botPost('Sorry, no rules link configured.')
  }
}

export default {
  desc: 'Display the link to the FF rules.',
  usage: '!rules',
  run,
}
