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

  test('Should persist the selected Welsh language across pages', async () => {
    const languageResponse = await server.inject({
      method: 'GET',
      url: '/language/cy?returnUrl=%2F'
    })
    const languageCookie = languageResponse.headers['set-cookie']
      .find((cookie) => cookie.startsWith('i18next='))
      .split(';', 1)[0]

    expect(languageResponse.headers.location).toBe('/')

    const homePage = await server.inject({
      method: 'GET',
      url: '/',
      headers: { cookie: languageCookie }
    })
    const questionPage = await server.inject({
      method: 'GET',
      url: '/juggling-balls',
      headers: { cookie: languageCookie }
    })

    expect(homePage.result).toContain('<html lang="cy"')
    expect(homePage.result).toContain('Gwneud cais am drwydded jyglo')
    expect(homePage.result).toContain('Dechrau nawr')
    expect(homePage.result).toMatch(
      /<a class="govuk-footer__link" href="\/language\/en\?returnUrl=%2F" lang="en">\s*English\s*<\/a>/
    )
    expect(questionPage.result).toContain('Faint o beli allwch chi eu jyglo?')
  })

  test('Should link to Welsh as Cymru from English pages', async () => {
    const { result, statusCode } = await server.inject({
      method: 'GET',
      url: '/'
    })

    expect(result).toMatch(
      /<a class="govuk-footer__link" href="\/language\/cy\?returnUrl=%2F" lang="cy">\s*Cymru\s*<\/a>/
    )
    expect(statusCode).toBe(statusCodes.ok)
  })
})
