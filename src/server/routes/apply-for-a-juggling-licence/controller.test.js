import { createServer } from '#/server/server.js'
import { statusCodes } from '#/server/common/constants/status-codes.js'

const redirect = 302

describe('#applyForAJugglingLicence', () => {
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  function getCookie(...responses) {
    const cookies = new Map()

    for (const response of responses) {
      for (const cookie of response.headers['set-cookie'] ?? []) {
        const cookieValue = cookie.split(';')[0]
        const cookieName = cookieValue.split('=', 1)[0]
        cookies.set(cookieName, cookieValue)
      }
    }

    return [...cookies.values()].join('; ')
  }

  function getCrumb(response) {
    return response.result.match(/name="crumb" value="([^"]+)"/)?.[1]
  }

  function postWithCrumb(url, payload, page, ...previousResponses) {
    return server.inject({
      method: 'POST',
      url,
      headers: { cookie: getCookie(...previousResponses, page) },
      payload: { ...payload, crumb: getCrumb(page) }
    })
  }

  test.each(['/juggling-balls', '/juggling-trick', '/check-answers'])(
    'Should reject a POST to %s without a CSRF token',
    async (url) => {
      const { statusCode } = await server.inject({
        method: 'POST',
        url,
        payload: {}
      })

      expect(statusCode).toBe(statusCodes.forbidden)
    }
  )

  test('Should show a validation error when the ball count is missing', async () => {
    const ballsPage = await server.inject({
      method: 'GET',
      url: '/juggling-balls'
    })
    const { result, statusCode } = await postWithCrumb(
      '/juggling-balls',
      {},
      ballsPage
    )

    expect(result).toContain('There is a problem')
    expect(result).toContain('Select how many balls you can juggle')
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should use each question as the heading without a caption', async () => {
    const ballsPage = await server.inject({
      method: 'GET',
      url: '/juggling-balls'
    })

    expect(ballsPage.result).toMatch(
      /<h1 class="govuk-fieldset__heading">\s*How many balls can you juggle\?\s*<\/h1>/
    )
    expect(ballsPage.result).toContain('name="crumb"')
    expect(ballsPage.result).not.toContain('data-testid="app-heading-caption"')

    const ballsResponse = await postWithCrumb(
      '/juggling-balls',
      { 'how-many-balls': '3 or more' },
      ballsPage
    )
    const trickPage = await server.inject({
      method: 'GET',
      url: '/juggling-trick',
      headers: { cookie: getCookie(ballsPage, ballsResponse) }
    })

    expect(trickPage.result).toMatch(
      /<h1 class="govuk-label-wrapper">\s*<label class="govuk-label govuk-label--l"[^>]*>\s*What is your most impressive juggling trick\?\s*<\/label>\s*<\/h1>/
    )
    expect(trickPage.result).toContain('name="crumb"')
    expect(trickPage.result).not.toContain('data-testid="app-heading-caption"')
  })

  test.each([
    ['3 or more', '/juggling-trick'],
    ['1 or 2', '/ineligible'],
    ['None - I cannot juggle', '/ineligible']
  ])('Should route the answer %s to %s', async (howManyBalls, destination) => {
    const ballsPage = await server.inject({
      method: 'GET',
      url: '/juggling-balls'
    })
    const { statusCode, headers } = await postWithCrumb(
      '/juggling-balls',
      { 'how-many-balls': howManyBalls },
      ballsPage
    )

    expect(statusCode).toBe(redirect)
    expect(headers.location).toBe(destination)
  })

  test('Should reject an unrecognised ball-count answer', async () => {
    const ballsPage = await server.inject({
      method: 'GET',
      url: '/juggling-balls'
    })
    const { result, statusCode } = await postWithCrumb(
      '/juggling-balls',
      { 'how-many-balls': 'two and a half' },
      ballsPage
    )

    expect(result).toContain('There is a problem')
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should render the ineligible page with a next step', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/ineligible'
    })

    expect(result).toContain('juggle 3 or more balls')
    expect(result).toContain('Return to the start page')
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should require the eligible answer before showing the trick question', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/juggling-trick'
    })

    expect(statusCode).toBe(redirect)
    expect(headers.location).toBe('/apply-for-a-juggling-licence')
  })

  test('Should show a validation error when the trick answer is blank', async () => {
    const ballsPage = await server.inject({
      method: 'GET',
      url: '/juggling-balls'
    })
    const ballsResponse = await postWithCrumb(
      '/juggling-balls',
      { 'how-many-balls': '3 or more' },
      ballsPage
    )
    const trickPage = await server.inject({
      method: 'GET',
      url: '/juggling-trick',
      headers: { cookie: getCookie(ballsPage, ballsResponse) }
    })
    const { result, statusCode } = await postWithCrumb(
      '/juggling-trick',
      { 'most-impressive-trick': '   ' },
      trickPage,
      ballsPage,
      ballsResponse
    )

    expect(result).toContain('There is a problem')
    expect(statusCode).toBe(statusCodes.ok)
  })

  test('Should complete the eligible journey and show answers and a reference', async () => {
    const ballsPage = await server.inject({
      method: 'GET',
      url: '/juggling-balls'
    })
    const ballsResponse = await postWithCrumb(
      '/juggling-balls',
      { 'how-many-balls': '3 or more' },
      ballsPage
    )

    expect(ballsResponse.headers.location).toBe('/juggling-trick')

    const trickPage = await server.inject({
      method: 'GET',
      url: '/juggling-trick',
      headers: { cookie: getCookie(ballsPage, ballsResponse) }
    })
    const trickResponse = await postWithCrumb(
      '/juggling-trick',
      {
        'most-impressive-trick': 'A five-ball cascade while riding a unicycle'
      },
      trickPage,
      ballsPage,
      ballsResponse
    )

    expect(trickResponse.headers.location).toBe('/check-answers')

    const checkAnswersResponse = await server.inject({
      method: 'GET',
      url: '/check-answers',
      headers: {
        cookie: getCookie(ballsPage, ballsResponse, trickPage, trickResponse)
      }
    })

    expect(checkAnswersResponse.result).toContain('3 or more')
    expect(checkAnswersResponse.result).toContain(
      'A five-ball cascade while riding a unicycle'
    )
    expect(checkAnswersResponse.result).toContain('href="/juggling-balls"')
    expect(checkAnswersResponse.result).toContain('href="/juggling-trick"')

    const checkAnswersPostResponse = await postWithCrumb(
      '/check-answers',
      {},
      checkAnswersResponse,
      ballsPage,
      ballsResponse,
      trickPage,
      trickResponse
    )

    expect(checkAnswersPostResponse.headers.location).toBe('/confirmation')

    const confirmationResponse = await server.inject({
      method: 'GET',
      url: '/confirmation',
      headers: { cookie: getCookie(checkAnswersPostResponse) }
    })

    expect(confirmationResponse.result).toContain('Application complete')
    expect(confirmationResponse.result).toMatch(/JL-[A-Z0-9]{8}/)
  })

  test('Should redirect to start when check answers is visited without a complete eligible journey', async () => {
    const { statusCode, headers } = await server.inject({
      method: 'GET',
      url: '/check-answers'
    })

    expect(statusCode).toBe(redirect)
    expect(headers.location).toBe('/apply-for-a-juggling-licence')
  })
})
