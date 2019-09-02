import { Server, Request } from '@hapi/hapi'
import Boom from '@hapi/boom'
import Joi from '@hapi/joi'

import commands from '../commands'

export interface GroupMeHook {
  attachments: Array<{
    type: string
    url: string
  }>
  avatar_url: string
  created_at: number
  group_id: string
  id: string
  name: string
  sender_id: string
  sender_type: string
  sender_guid: string
  system: boolean
  text: string
  user_id: string
}

interface Response {
  status: boolean | string
  msg: string
}

export function groupme(server: Server): void {
  server.route({
    method: 'POST',
    path: '/hooks/groupme',
    options: {
      handler: async (request: Request): Promise<Response | Boom> => {
        const payload = request.payload as GroupMeHook

        if (payload.system) {
          const msg = 'system message, nothing to do'
          server.logger().debug('hooks.groupme', msg)
          return { status: false, msg }
        }

        if (payload.sender_type === 'bot') {
          const msg = 'bot message, nothing to do'
          server.logger().debug('hooks.groupme', msg)
          return { status: false, msg }
        }

        if (!payload.text.trim().startsWith('!')) {
          const msg = 'not command, does not start with `!`'
          server.logger().debug('hooks.groupme', msg)
          return { status: false, msg }
        }

        if (payload.text.trim().length <= 1) {
          const msg = 'not command, just a `!`'
          server.logger().debug('hooks.groupme', msg)
          return { status: false, msg }
        }

        const tokens = payload.text
          .trim()
          .slice(1)
          .split(' ')
        const commandName = tokens[0]
        const command = commands[commandName]

        if (!command) {
          const msg = `${commandName} is not a command`
          server.logger().debug('hooks.groupme', msg)
          return { status: false, msg }
        }

        try {
          await command.run(server, tokens, payload)
        } catch (err) {
          return Boom.internal(err)
        }

        const msg = `ran command: ${commandName}`
        server.logger().debug('hooks.groupme', msg)
        return { status: 'ok', msg }
      },
      description: 'Groupme webhook',
      notes: 'POST a payload to the groupme webhook',
      tags: ['api', 'hooks'],
      validate: {
        /* eslint-disable @typescript-eslint/camelcase */
        payload: Joi.object()
          .keys({
            attachments: Joi.array().items(
              Joi.object()
                .keys({
                  type: Joi.string(),
                  url: Joi.string(),
                })
                .unknown(true),
            ),
            avatar_url: Joi.string().allow(null),
            created_at: Joi.date().timestamp('unix'),
            group_id: Joi.string(),
            id: Joi.string(),
            name: Joi.string(),
            sender_id: Joi.string(),
            sender_type: Joi.string(),
            source_guid: Joi.string(),
            system: Joi.boolean(),
            text: Joi.string().allow(''),
            user_id: Joi.string(),
          })
          .unknown(true),
        /* eslint-enable @typescript-eslint/camelcase */
      },
    },
  })
}

export default function register(server: Server): void {
  groupme(server)
}
