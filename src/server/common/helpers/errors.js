import { statusCodes } from '../constants/status-codes.js'

function statusCodeMessage(statusCode, t) {
  switch (statusCode) {
    case statusCodes.notFound:
      return t ? t('errors.notFound') : 'Page not found'
    case statusCodes.forbidden:
      return t ? t('errors.forbidden') : 'Forbidden'
    case statusCodes.unauthorized:
      return t ? t('errors.unauthorized') : 'Unauthorized'
    case statusCodes.badRequest:
      return t ? t('errors.badRequest') : 'Bad Request'
    default:
      return t ? t('errors.default') : 'Something went wrong'
  }
}

export function catchAll(request, h) {
  const { response } = request

  if (!('isBoom' in response)) {
    return h.continue
  }

  const statusCode = response.output.statusCode
  const errorMessage = statusCodeMessage(statusCode, request.t)

  if (statusCode >= statusCodes.internalServerError) {
    request.logger.error(response?.stack)
  }

  return h
    .view('error/index', {
      pageTitle: errorMessage,
      heading: statusCode,
      message: errorMessage
    })
    .code(statusCode)
}
