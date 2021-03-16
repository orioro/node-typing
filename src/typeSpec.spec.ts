import { testCases } from '@orioro/jest-util'

import {
  stringifyTypeSpec,
  anyType,
  singleType,
  oneOfTypes,
  enumType,
  indefiniteArrayOfType,
  indefiniteObjectOfType,
  tupleType,
  objectType,
} from './typeSpec'

describe('stringifyTypeSpec', () => {
  testCases(
    [
      ['string', 'string'],
      [['string', 'number'], 'string | number'],
      [anyType(), 'any'],
      [anyType({ not: 'string' }), 'any!string'],
      [singleType('string'), 'string'],
      [oneOfTypes(['string', 'number']), 'string | number'],
      [enumType(['STR_A', 9, false]), 'STR_A, 9, false'],
      [indefiniteArrayOfType('string'), 'string[]'],
      [indefiniteObjectOfType('string'), 'string{}'],
      [tupleType(['string', 'number']), '[string, number]'],
      [objectType({ key1: 'string', key2: 'number' }), '{ key1, key2 }'],

      [
        tupleType([
          objectType({ key1: 'string', key2: 'number' }),
          'string',
          indefiniteArrayOfType('boolean'),
        ]),
        '[{ key1, key2 }, string, boolean[]]',
      ],
    ],
    stringifyTypeSpec
  )
})
