import { Server } from '@hapi/hapi'

export default function register(server: Server): void {
  server.route({
    method: 'GET',
    path: '/{param*}',
    options: {
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
        },
      },
      description: 'The home page of the bot.',
      notes: 'GET the home page of the bot.',
      tags: ['home'],
    },
  })
}
