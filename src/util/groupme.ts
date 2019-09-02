import { Server } from '@hapi/hapi'
import Wreck from '@hapi/wreck'

export default class GroupMe {
  readonly server: Server
  readonly botId: string
  readonly token: string
  readonly baseUrl: string
  readonly client: any

  constructor(server: Server, { botId, token, baseUrl }: { botId: string; token: string; baseUrl: string }) {
    this.server = server
    this.botId = botId
    this.token = token
    this.baseUrl = baseUrl

    this.client = Wreck.defaults({
      baseUrl: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  async callApi(method: string, url: string, options: any): Promise<{ [propName: string]: any } | false> {
    let body
    try {
      const response = await this.client.request(method.toUpperCase(), `${url}?token=${this.token}`, options)
      body = await Wreck.read(response, {
        json: true,
      })
    } catch (err) {
      this.server.logger().error(err)
      return false
    }
    return body
  }

  async botPost(text: string, pictureUrl?: string): Promise<boolean> {
    this.server.logger().debug({ msg: 'groupme.botPost sending message', text, pictureUrl })
    console.log(this)
    const response = await this.callApi('post', 'bots/post', {
      payload: {
        /* eslint-disable @typescript-eslint/camelcase */
        bot_id: this.botId,
        text,
        picture_url: pictureUrl,
        /* eslint-enable @typescript-eslint/camelcase */
      },
    })

    if (response && response.meta && response.meta >= 400) {
      this.server.logger().error({ msg: 'groupme.botPost failed to post', response })
      return false
    }

    return !!response
  }
}
