import { config } from '../../config.js'

export function buildNavigation(request) {
  return [
    {
      text: 'Home',
      href: '/',
      current: request?.path === '/'
    },
    {
      text: 'About',
      href: '/about',
      current: request?.path === '/about'
    },
    {
      text: config.get('serviceName'),
      href: '/apply-for-a-juggling-licence',
      current: Boolean(
        request?.path?.startsWith('/apply-for-a-juggling-licence')
      )
    }
  ]
}
