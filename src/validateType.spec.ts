import { testCases } from '@orioro/jest-util'

import { singleType } from './typeSpec'
import { validateType } from './typing'

describe('validateType(typeSpec, value)', () => {
  testCases(
    [
      ['string', 'some str', undefined],
      ['string', null, new TypeError('Expected `string` but got `null`: null')],
      [
        singleType('string'),
        null,
        new TypeError('Expected `string` but got `null`: null'),
      ],
      [
        ['string', 'number'],
        null,
        new TypeError('Expected `string | number` but got `null`: null'),
      ],
    ],
    validateType
  )
})
