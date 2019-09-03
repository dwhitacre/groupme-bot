import 'dotenv/config'
import { expect } from 'chai'
import Wreck from '@hapi/wreck'

describe('fvt', function() {
  it('should be able to get health', async function() {
    const response = await Wreck.request('GET', `http://${process.env.HOST}:${process.env.PORT}/health`, {})
    const payload = await Wreck.read(response, { json: true })
    expect(payload.status).to.equal('ok')
  })
})
