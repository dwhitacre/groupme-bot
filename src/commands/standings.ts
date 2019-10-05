import { Server } from '@hapi/hapi'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function run(server: Server, _: Array<string>): Promise<void> {
  const standings = await server.fantasypros().mpbLeagueProjectedStandings()

  if (!standings) {
    await server.groupme().botPost('Failed to retrieve fantasy pros projected standings.')
    return
  }

  if (standings.length < 1) {
    await server.groupme().botPost('Failed to find standings on fantasy pros projected standings.')
    return
  }

  await server.groupme().botPost(`Projected Standings:
${standings
  .reduce((acc, curr) => {
    return `${acc}
${curr.rank} (${curr.rankChange}): ${curr.team} (${curr.currentRecord})
- Projection: ${curr.projRecord} (${curr.odds})`
  }, '')
  .slice(1)}`)
  return
}

export default {
  desc: 'Display the FantasyPros projected standings.',
  usage: '!standings',
  run,
  enabled: true,
  hidden: false,
}
