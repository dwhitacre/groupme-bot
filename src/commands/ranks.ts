import { Server } from '@hapi/hapi'

const usage = '!ranks [week|draft|dyn|ros]'

async function run(server: Server, tokens: Array<string>): Promise<void> {
  const period = tokens.length <= 1 ? 'ros' : tokens[1]

  if (!['week', 'draft', 'dyn', 'ros'].includes(period)) {
    await server.groupme().botPost(`Unrecognized argument.

Usage:
${usage}`)
    return
  }

  const rankings = await server.fantasypros().mpbLeaguePowerRankings(period as 'week' | 'draft' | 'dyn' | 'ros')

  if (!rankings) {
    await server.groupme().botPost('Failing to retrieve fantasy pros rankings.')
    return
  }

  if (rankings.ranks.length < 1) {
    await server.groupme().botPost('Failed to find ranks on fantasy pros rankings.')
    return
  }

  await server.groupme().botPost(`${rankings.periodName} Rankings:
${rankings.ranks
  .reduce((acc, curr) => {
    return `${acc}
${curr.rank}: ${curr.team} - ${curr.score}`
  }, '')
  .slice(1)}`)
  return
}

export default {
  desc: 'Display the FantasyPros power rankings.',
  usage,
  run,
}
