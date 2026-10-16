import { config } from '../../config.js'

export function buildNavigation(
  request,
  t = (_key, { defaultValue } = {}) => defaultValue
) {
  return [
    {
      text: t('navigation.home', { defaultValue: 'Home' }),
      href: '/',
      current: request?.path === '/'
    },
    {
      text: t('navigation.about', { defaultValue: 'About' }),
      href: '/about',
      current: request?.path === '/about'
    },
    {
      text: t('serviceName', {
        defaultValue: config.get('serviceName')
      }),
      href: '/apply-for-a-juggling-licence',
      current: Boolean(
        request?.path?.startsWith('/apply-for-a-juggling-licence')
      )
    }
  ]
}
