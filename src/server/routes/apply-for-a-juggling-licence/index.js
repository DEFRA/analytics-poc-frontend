import {
  startController,
  jugglingBallsController,
  jugglingBallsPostController,
  ineligibleController,
  jugglingTrickController,
  jugglingTrickPostController,
  checkYourAnswersController,
  checkYourAnswersPostController,
  confirmationController
} from './controller.js'

/**
 * Sets up the routes used in the apply for a juggling licence example journey.
 * These routes are registered in src/server/plugins/router.js.
 */
export const applyForAJugglingLicence = {
  plugin: {
    name: 'apply-for-a-juggling-licence',
    register(server) {
      server.route([
        {
          method: 'GET',
          path: '/apply-for-a-juggling-licence',
          ...startController
        },
        {
          method: 'GET',
          path: '/juggling-balls',
          ...jugglingBallsController
        },
        {
          method: 'POST',
          path: '/juggling-balls',
          ...jugglingBallsPostController
        },
        {
          method: 'GET',
          path: '/ineligible',
          ...ineligibleController
        },
        {
          method: 'GET',
          path: '/juggling-trick',
          ...jugglingTrickController
        },
        {
          method: 'POST',
          path: '/juggling-trick',
          ...jugglingTrickPostController
        },
        {
          method: 'GET',
          path: '/check-answers',
          ...checkYourAnswersController
        },
        {
          method: 'POST',
          path: '/check-answers',
          ...checkYourAnswersPostController
        },
        {
          method: 'GET',
          path: '/confirmation',
          ...confirmationController
        }
      ])
    }
  }
}
