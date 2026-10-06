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

function mapValidationErrors(error) {
  const errorList = []
  const errors = {}

  for (const detail of error.details) {
    const field = detail.path[0]

    errorList.push({ text: detail.message, href: `#${field}` })
    errors[field] = { text: detail.message }
  }

  return { errorList, errors }
}

export const jugglingBallsController = {
  handler(request, h) {
    const { 'how-many-balls': howManyBalls } = getJourney(request)

    return h.view('apply-for-a-juggling-licence/juggling-balls', {
      pageTitle: 'How many balls can you juggle?',
      howManyBalls
    })
  }
}

export const jugglingBallsPostController = {
  options: {
    plugins: { crumb: false },
    validate: {
      payload: Joi.object({
        'how-many-balls': Joi.string()
          .valid('3 or more', '1 or 2', 'None - I cannot juggle')
          .required()
          .messages({
            '*': 'Select how many balls you can juggle'
          })
      }),
      failAction(request, h, error) {
        const { errorList, errors } = mapValidationErrors(error)

        return h
          .view('apply-for-a-juggling-licence/juggling-balls', {
            pageTitle: 'How many balls can you juggle?',
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
  handler(_request, h) {
    return h.view('apply-for-a-juggling-licence/ineligible', {
      pageTitle: 'You are not eligible for a juggling licence'
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
      pageTitle: 'What is your most impressive juggling trick?',
      mostImpressiveTrick: journey['most-impressive-trick']
    })
  }
}

export const jugglingTrickPostController = {
  options: {
    plugins: { crumb: false },
    validate: {
      payload: Joi.object({
        'most-impressive-trick': Joi.string()
          .trim()
          .min(1)
          .required()
          .messages({
            '*': 'Enter your most impressive juggling trick'
          })
      }),
      failAction(request, h, error) {
        const { errorList, errors } = mapValidationErrors(error)

        return h
          .view('apply-for-a-juggling-licence/juggling-trick', {
            pageTitle: 'What is your most impressive juggling trick?',
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
      pageTitle: 'Check your answers before sending your application',
      howManyBalls: journey['how-many-balls'],
      mostImpressiveTrick: journey['most-impressive-trick']
    })
  }
}

export const checkYourAnswersPostController = {
  options: {
    plugins: { crumb: false }
  },
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
      pageTitle: 'Application complete',
      referenceNumber
    })
  }
}
