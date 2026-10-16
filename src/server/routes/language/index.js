import Joi from 'joi'

import { supportedLanguages } from '#/config/i18n.js'
import { languageController } from './controller.js'

export const language = {
  plugin: {
    name: 'language',
    register(server) {
      server.route({
        method: 'GET',
        path: '/language/{language}',
        options: {
          validate: {
            params: Joi.object({
              language: Joi.string()
                .valid(...supportedLanguages)
                .required()
            })
          }
        },
        ...languageController
      })
    }
  }
}
