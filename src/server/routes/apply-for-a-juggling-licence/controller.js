import Joi from 'joi'
import { randomUUID } from 'node:crypto'

const sessionKey = 'jugglingLicence'
const startPath = '/apply-for-a-juggling-licence'

function getJourney(request) {
  return request.yar.get(sessionKey) || {}
}

function setJourney(request, data) {
  request.yar.set(sessionKey, { ...getJourney(request), ...data })
}

function hasCompletedDetails(journey) {
  return Boolean(
    journey['how-many-balls'] === '3 or more' &&
    journey['most-impressive-trick']
  )
}

function getHowManyBallsText(request, answer) {
  const translationKeys = {
    '3 or more': 'journey:balls.options.threeOrMore',
    '1 or 2': 'journey:balls.options.oneOrTwo',
    'None - I cannot juggle': 'journey:balls.options.none'
  }

  return request.t(translationKeys[answer])
}

function mapValidationErrors(error, message) {
  const errorList = []
  const errors = {}

  for (const detail of error.details) {
    const field = detail.path[0]

    errorList.push({ text: message, href: `#${field}` })
    errors[field] = { text: message }
  }

  return { errorList, errors }
}

export const jugglingBallsController = {
  handler(request, h) {
    const { 'how-many-balls': howManyBalls } = getJourney(request)

    return h.view('apply-for-a-juggling-licence/juggling-balls', {
      pageTitle: request.t('journey:balls.title'),
      howManyBalls
    })
  }
}

export const jugglingBallsPostController = {
  options: {
    validate: {
      payload: Joi.object({
        'how-many-balls': Joi.string()
          .valid('3 or more', '1 or 2', 'None - I cannot juggle')
          .required()
      }),
      failAction(request, h, error) {
        const { errorList, errors } = mapValidationErrors(
          error,
          request.t('journey:balls.validation')
        )

        return h
          .view('apply-for-a-juggling-licence/juggling-balls', {
            pageTitle: request.t('journey:balls.title'),
            howManyBalls: request.payload?.['how-many-balls'],
            errorList,
            errors
          })
          .takeover()
      }
    }
  },
  handler(request, h) {
    const { 'how-many-balls': howManyBalls } = request.payload

    setJourney(request, { 'how-many-balls': howManyBalls })

    return h.redirect(
      howManyBalls === '3 or more' ? '/juggling-trick' : '/ineligible'
    )
  }
}

export const ineligibleController = {
  handler(request, h) {
    return h.view('apply-for-a-juggling-licence/ineligible', {
      pageTitle: request.t('journey:ineligible.title')
    })
  }
}

export const jugglingTrickController = {
  handler(request, h) {
    const journey = getJourney(request)

    if (journey['how-many-balls'] !== '3 or more') {
      return h.redirect(startPath)
    }

    return h.view('apply-for-a-juggling-licence/juggling-trick', {
      pageTitle: request.t('journey:trick.title'),
      mostImpressiveTrick: journey['most-impressive-trick']
    })
  }
}

export const jugglingTrickPostController = {
  options: {
    validate: {
      payload: Joi.object({
        'most-impressive-trick': Joi.string().trim().min(1).required()
      }),
      failAction(request, h, error) {
        const { errorList, errors } = mapValidationErrors(
          error,
          request.t('journey:trick.validation')
        )

        return h
          .view('apply-for-a-juggling-licence/juggling-trick', {
            pageTitle: request.t('journey:trick.title'),
            mostImpressiveTrick: request.payload?.['most-impressive-trick'],
            errorList,
            errors
          })
          .takeover()
      }
    }
  },
  handler(request, h) {
    const journey = getJourney(request)

    if (journey['how-many-balls'] !== '3 or more') {
      return h.redirect(startPath)
    }

    setJourney(request, {
      'most-impressive-trick': request.payload['most-impressive-trick']
    })

    return h.redirect('/check-answers')
  }
}

export const checkYourAnswersController = {
  handler(request, h) {
    const journey = getJourney(request)

    if (!hasCompletedDetails(journey)) {
      return h.redirect(startPath)
    }

    return h.view('apply-for-a-juggling-licence/check-your-answers', {
      pageTitle: request.t('journey:checkAnswers.title'),
      howManyBallsText: getHowManyBallsText(request, journey['how-many-balls']),
      mostImpressiveTrick: journey['most-impressive-trick']
    })
  }
}

export const checkYourAnswersPostController = {
  handler(request, h) {
    const journey = getJourney(request)

    if (!hasCompletedDetails(journey)) {
      return h.redirect(startPath)
    }

    const referenceNumber = `JL-${randomUUID().slice(0, 8).toUpperCase()}`

    setJourney(request, { referenceNumber })

    return h.redirect('/confirmation')
  }
}

export const confirmationController = {
  handler(request, h) {
    const { referenceNumber } = getJourney(request)

    if (!referenceNumber) {
      return h.redirect(startPath)
    }

    request.yar.clear(sessionKey)

    return h.view('apply-for-a-juggling-licence/confirmation', {
      pageTitle: request.t('journey:confirmation.title'),
      referenceNumber
    })
  }
}
