import { Server } from '@hapi/hapi'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function run(server: Server, _: Array<string>): Promise<void> {
  if (process.env.IMAGES_VOTE) {
    await server.groupme().botPost('', process.env.IMAGES_VOTE)
  } else {
    await server.groupme().botPost('Sorry, no vote image configured.')
  }
}

export default {
  desc: "Display Jeff's vote gif.",
  usage: '!vote',
  run,
}
