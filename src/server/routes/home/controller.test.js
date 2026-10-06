import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should link the start page to the first question', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toContain('govuk-service-navigation__service-name')
    expect(result).toContain('Apply for a juggling licence')
    expect(result).not.toContain('govuk-service-navigation__list')
    expect(result).toContain('href="/juggling-balls"')
    expect(statusCode).toBe(statusCodes.ok)
  })
})
