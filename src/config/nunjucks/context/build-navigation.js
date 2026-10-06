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
      text: 'Apply for a juggling licence',
      href: '/apply-for-a-juggling-licence',
      current: Boolean(
        request?.path?.startsWith('/apply-for-a-juggling-licence')
      )
    }
  ]
}
