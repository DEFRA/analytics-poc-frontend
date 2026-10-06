import { config } from '../../config.js'

export function buildNavigation(request, t) {
  const translate = t ?? ((_key, { defaultValue } = {}) => defaultValue)

  return [
    {
      text: translate('navigation.home', { defaultValue: 'Home' }),
      href: '/',
      current: request?.path === '/'
    },
    {
      text: translate('navigation.about', { defaultValue: 'About' }),
      href: '/about',
      current: request?.path === '/about'
    },
    {
      text: translate('serviceName', {
        defaultValue: config.get('serviceName')
      }),
      href: '/apply-for-a-juggling-licence',
      current: Boolean(
        request?.path?.startsWith('/apply-for-a-juggling-licence')
      )
    }
  ]
}
