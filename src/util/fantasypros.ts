import { Server } from '@hapi/hapi'
import Wreck from '@hapi/wreck'
import cheerio from 'cheerio'

export default class FantasyPros {
  readonly server: Server
  readonly mpbKey: string
  readonly mpbBaseUrl: string
  readonly client: any

  constructor(server: Server, { mpbKey, mpbBaseUrl }: { mpbKey: string; mpbBaseUrl: string }) {
    this.server = server
    this.mpbKey = mpbKey
    this.mpbBaseUrl = mpbBaseUrl

    this.client = Wreck.defaults({
      baseUrl: this.mpbBaseUrl,
    })
  }

  async mpbLeaguePowerRankings(
    period: 'week' | 'draft' | 'dyn' | 'ros',
  ): Promise<
    | {
        periodName: string
        ranks: Array<{
          rank: string
          team: string
          score: string
        }>
      }
    | false
  > {
    this.server.logger().debug({ msg: 'fantasypros.mpbLeaguePowerRankings period param', period })

    const rankings: any = {}
    try {
      const { payload } = await this.client.get(`analyzer_nfl/team.jsp?key=${this.mpbKey}&period=${period}`, {})
      const $ = cheerio.load(payload)

      rankings.periodName = $(`div.SiteSelector option[value="${period}"]`)
        .text()
        .replace(/[Rr]ankings/, '')
        .trim()

      rankings.ranks = $('table.StandingsTable tbody > tr')
        .map(function(this: CheerioElement) {
          return {
            rank: $('td.col1', this).text(),
            team: $('td.col2', this).text(),
            score: $('td.col3', this).text(),
          }
        })
        .get()
    } catch (err) {
      this.server.logger().error(err)
      return false
    }

    this.server.logger().debug({ msg: 'fantasypros.mpbLeaguePowerRankings rankings result', rankings })
    return rankings as {
      periodName: string
      ranks: Array<{
        rank: string
        team: string
        score: string
      }>
    }
  }

  async mpbLeagueProjectedStandings(): Promise<
    | Array<{
        rank: string
        team: string
        currentRecord: string
        projRecord: string
        rankChange: string
        odds: string
      }>
    | false
  > {
    this.server.logger().debug('fantasypros.mpbLeagueProjectedStandings')

    let standings: any = []
    try {
      const { payload } = await this.client.get(`analyzer_nfl/projectedStandings.jsp?key=${this.mpbKey}`, {})
      const $ = cheerio.load(payload)

      standings = $('table.StandingsTable tbody > tr')
        .map(function(this: CheerioElement) {
          return {
            rank: $('td:nth-child(1)', this).text(),
            team: $('td:nth-child(2)', this).text(),
            currentRecord: $('td:nth-child(3)', this).text(),
            projRecord: $('td:nth-child(4)', this).text(),
            rankChange: $('td:nth-child(5)', this).text(),
            odds: $('td:nth-child(6)', this).text(),
          }
        })
        .get()
    } catch (err) {
      this.server.logger().error(err)
      return false
    }

    this.server.logger().debug({ msg: 'fantasypros.mpbLeagueProjectedStandings standings result', standings })
    return standings as Array<{
      rank: string
      team: string
      currentRecord: string
      projRecord: string
      rankChange: string
      odds: string
    }>
  }
}
