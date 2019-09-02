import { Server } from '@hapi/hapi'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function run(server: Server, _: Array<string>): Promise<void> {
  if (process.env.FF_ROSTERS) {
    await server.groupme().botPost(process.env.FF_ROSTERS)
  } else {
    await server.groupme().botPost('Sorry, no rosters link configured.')
  }
}

export default {
  desc: 'Display the link to the FF rosters.',
  usage: '!rosters',
  run,
}
