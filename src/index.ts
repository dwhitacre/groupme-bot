import 'dotenv/config'
import Hapi from '@hapi/hapi'
import drive from 'drive-db'
import { resolve } from 'path'

import routes from './routes'
import GroupMe from './util/groupme'
import FantasyPros from './util/fantasypros'

async function start(): Promise<void> {
  const server = new Hapi.Server({
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
    routes: {
      files: {
        relativeTo: resolve(__dirname, '../public'),
      },
    },
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

  const fp = new FantasyPros(server, {
    mpbBaseUrl: process.env.FP_MPBBASEURL || 'https://mpbnfl.fantasypros.com/',
    mpbKey: process.env.FP_MPBKEY!,
  })
  server.decorate('server', 'fantasypros', function(): FantasyPros {
    return fp
  })

  routes(server)

  await server.start()

  process.on('SIGTERM', async function() {
    server.logger().warn('SIGTERM received, shutting down.')
    await server.stop()
    server.logger().warn('Server shutdown. Exiting..')
    process.exit(0)
  })
}

if (!process.env.GROUPME_BOTID) {
  console.error('Missing GROUPME_BOTID')
  process.exit(1)
}

if (!process.env.GROUPME_TOKEN) {
  console.error('Missing GROUPME_TOKEN')
  process.exit(1)
}

if (!process.env.FP_MPBKEY) {
  console.error('Missing FP_MPBKEY')
  process.exit(1)
}

if (!process.env.DRIVE_CUSTOM_COMMANDS) {
  console.error('Missing DRIVE_CUSTOM_COMMANDS')
  process.exit(1)
}

drive({
  sheet: process.env.DRIVE_CUSTOM_COMMANDS,
  cache: 0,
})

start().catch(err => {
  console.error(err)
  process.exit(1)
})
