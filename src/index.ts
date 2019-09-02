import 'dotenv/config'
import Hapi from '@hapi/hapi'

import routes from './routes'
import GroupMe from './util/groupme'

async function start(): Promise<void> {
  const server = new Hapi.Server({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
  })

  const loggingPlugin: any = {
    plugin: await import('hapi-pino'),
    options: {
      redact: ['req.headers.authorization'],
      prettyPrint: !!process.env.LOG_PRETTY,
      level: process.env.LOG_LEVEL || 'info',
      logPayload: !!process.env.LOG_PAYLOAD,
      logRouteTags: true,
      mergeHapiLogData: true,
      ignorePaths: ['/health'],
    },
  }

  const swaggerPlugin: any = {
    plugin: await import('hapi-swagger'),
    options: {
      info: {
        title: 'GroupMe Bot API',
      },
    },
  }

  await server.register(loggingPlugin)
  await server.register(await import('@hapi/inert'))
  await server.register(await import('@hapi/vision'))
  await server.register(swaggerPlugin)

  const gm = new GroupMe(server, {
    botId: process.env.GROUPME_BOTID!,
    token: process.env.GROUPME_TOKEN!,
    baseUrl: process.env.GROUPME_BASEURL || 'https://api.groupme.com/v3/',
  })
  server.decorate('server', 'groupme', function(): GroupMe {
    return gm
  })

  routes(server)

  await server.start()
}

if (!process.env.GROUPME_BOTID || !process.env.GROUPME_TOKEN) {
  console.error('Missing GROUPME_BOTID or GROUPME_TOKEN')
  process.exit(1)
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
