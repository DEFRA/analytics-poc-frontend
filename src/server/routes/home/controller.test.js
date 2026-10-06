import { createServer } from '#/server/server.js'

const redirect = 302

describe('#homeController', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  test('Should redirect to the juggling licence service start page', async () => {
    const { headers, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(headers.location).toBe('/apply-for-a-juggling-licence')
    expect(statusCode).toBe(redirect)
  })
})
