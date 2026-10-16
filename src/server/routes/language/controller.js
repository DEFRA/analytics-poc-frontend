export const languageController = {
  handler(request, h) {
    const { returnUrl } = request.query
    const redirectTo =
      returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
        ? returnUrl
        : '/'

    return h.redirect(redirectTo).state('i18next', request.params.language)
  }
}
