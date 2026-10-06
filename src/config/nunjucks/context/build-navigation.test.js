import { buildNavigation } from './build-navigation.js'

function mockRequest(options) {
  return { ...options }
}

describe('#buildNavigation', () => {
  test('Should provide expected navigation details', () => {
    expect(
      buildNavigation(mockRequest({ path: '/non-existent-path' }))
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      },
      {
        current: false,
        text: 'Apply for a juggling licence',
        href: '/apply-for-a-juggling-licence'
      }
    ])
  })

  test('Should provide expected highlighted navigation details', () => {
    expect(buildNavigation(mockRequest({ path: '/' }))).toEqual([
      {
        current: true,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      },
      {
        current: false,
        text: 'Apply for a juggling licence',
        href: '/apply-for-a-juggling-licence'
      }
    ])
  })

  test('Should highlight the juggling licence journey for any of its sub-pages', () => {
    expect(
      buildNavigation(
        mockRequest({ path: '/apply-for-a-juggling-licence/eligibility' })
      )
    ).toEqual([
      {
        current: false,
        text: 'Home',
        href: '/'
      },
      {
        current: false,
        text: 'About',
        href: '/about'
      },
      {
        current: true,
        text: 'Apply for a juggling licence',
        href: '/apply-for-a-juggling-licence'
      }
    ])
  })
})
