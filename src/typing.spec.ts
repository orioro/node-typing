import { testCases, fnCallLabel, variableName } from '@orioro/jest-util'
import { getType, validateType, CORE_TYPES, typing } from './typing'

const CORE_TYPE_NAMES = Object.keys(CORE_TYPES)

const TYPE_SAMPLES = {
  string: ['', 'Some string'],
  regexp: [/re/, new RegExp('test', 'g')],
  number: [-1, 90, Infinity],
  nan: [NaN],
  null: [null],
  undefined: [undefined],
  boolean: [true, false],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  function: [function () {}, function namedFunc() {}, () => {}],
  array: [[], ['1', '2', '3']],
  object: [{}, { key1: 'value1', key2: 'value2' }],
  bigint: [2n],
  date: [new Date()],
  symbol: [Symbol(), Symbol('symbolname')],
  map: [new Map()],
  weakmap: [new WeakMap()],
  set: [new Set()],
  weakset: [new WeakSet()],
}

describe('validateType(multipleTypes, value)', () => {
  testCases(
    [
      [['string', 'undefined'], undefined, undefined],
      [['string', 'undefined'], 'Some string', undefined],
      [['string', 'undefined'], '', undefined],
      [['string', 'undefined'], 9, TypeError],

      [['string', 'number'], undefined, TypeError],

      ['array', [], undefined],
      [['array', 'string'], ['array-item-1', 'array-item-2'], undefined],
      [['array', 'string'], 'Some string', undefined],
      [['array', 'string'], undefined, TypeError],
    ],
    validateType
  )
})

describe('validateType(objectTypeMap, value)', () => {
  const _renderLabel = (args, result) =>
    fnCallLabel(
      'validateType',
      [variableName('objectTypeMap'), ...args],
      result
    )

  describe('valid situations', () => {
    const objectTypeMap = {
      key1: 'string',
      key2: ['number', 'string'],
    }
    testCases(
      [
        [{ key1: 'str1', key2: 'str2' }, undefined],
        [{ key1: 'str1', key2: 123 }, undefined],
      ],
      validateType.bind(null, objectTypeMap),
      _renderLabel
    )
  })

  describe('simple situations', () => {
    const objectTypeMap = {
      key1: 'string',
      key2: ['number', 'string'],
    }
    testCases(
      [
        [{ key1: '123', key2: 123 }, undefined],
        [{ key1: 123, key2: 123 }, TypeError],
        [undefined, TypeError],
        ['Some str', TypeError],
      ],
      validateType.bind(null, objectTypeMap),
      _renderLabel
    )
  })

  describe('only allow known keys', () => {
    const objectTypeMap = {
      key1: 'string',
      key2: ['number', 'string'],
    }
    testCases(
      [
        // Control
        [{ key1: 'str1', key2: 123 }, undefined],

        // Missing key2
        [{ key1: 'str1' }, TypeError],

        // Missing key1 and key2
        [{}, TypeError],

        // Missing key1 and key2 (arrays are allowed in objectTypeMap)
        [[], TypeError],

        // Unknown key3
        [{ key1: 'str1', key2: 'str2', key3: 'str3' }, TypeError],
      ],
      validateType.bind(null, objectTypeMap),
      _renderLabel
    )
  })

  describe('allow undefined', () => {
    const objectTypeMap = {
      key1: 'string',
      key2: ['number', 'string'],
    }

    testCases(
      [
        [{ key1: '123', key2: 123 }, undefined],
        [undefined, undefined],
        // Invalid key2
        [{ key1: 123, key2: 123 }, TypeError],
        ['Some str', TypeError],
      ],
      (value) => validateType([objectTypeMap, 'undefined'], value),
      (args, result) =>
        fnCallLabel(
          'validateType',
          [[variableName('objectTypeMap'), 'undefined'], ...args],
          result
        )
    )
  })

  describe('deep nesting', () => {
    const objectTypeMap = {
      key1: 'string',
      key2: {
        key21: 'string',
        key22: ['array', 'undefined'],
      },
    }

    testCases(
      [
        [
          {
            key1: 'str',
            key2: { key21: 'str' },
          },
          undefined,
        ],
        [
          {
            key1: 'str',
            key2: { key21: 'str', key22: ['1', '2'] },
          },
          undefined,
        ],
        [
          {
            key1: 'str',
            key2: { key21: 'str', key22: 8 },
          },
          TypeError,
        ],
        [
          {
            key1: 'str',
            key2: { key21: 'str', key22: null },
          },
          TypeError,
        ],
        [
          {
            key1: 'str',
            key2: { key21: 'str', key23: 'Unknown' },
          },
          TypeError,
        ],
      ],
      validateType.bind(null, objectTypeMap),
      _renderLabel
    )
  })
})

describe('validateType(arrayTupleMap, value)', () => {
  describe('simple tuple', () => {
    const arrayTupleMap = {
      '0': 'string',
      '1': 'number',
    }

    testCases(
      [
        [arrayTupleMap, ['str', 8], undefined],
        [arrayTupleMap, ['str', 'str'], TypeError],
        [arrayTupleMap, ['str'], TypeError],
        [arrayTupleMap, [undefined, 8], TypeError],
      ],
      validateType
    )
  })

  describe('impossible to satisfy', () => {
    const arrayTupleMap = {
      // '0': 'string',
      '1': 'number',
    }

    testCases(
      [
        [arrayTupleMap, ['str', 8], TypeError],
        [arrayTupleMap, ['str', 'str'], TypeError],
        [arrayTupleMap, ['str'], TypeError],
        [arrayTupleMap, [undefined, 8], TypeError],
      ],
      validateType
    )
  })
})

describe('type: any', () => {
  const cases = Object.keys(TYPE_SAMPLES).reduce(
    (acc, sampleTypeName) => [
      ...acc,
      ...TYPE_SAMPLES[sampleTypeName].map((value) => ['any', value, undefined]),
    ],
    []
  )

  testCases(cases, validateType)
})

describe('getType(value)', () => {
  const cases = Object.keys(TYPE_SAMPLES).reduce(
    (acc, sampleTypeName) => [
      ...acc,
      ...TYPE_SAMPLES[sampleTypeName].map((value) => [value, sampleTypeName]),
    ],
    []
  )

  testCases(cases, getType)

  test('object from custom constructor', () => {
    expect(() => {
      function ConstructorA() {} // eslint-disable-line @typescript-eslint/no-empty-function
      expect(getType(new ConstructorA())).toEqual('object')
    }).toThrow('Could not identify value type: [object Object]')
  })
})

describe('validateType(typeName, value)', () => {
  test('all types have samples', () => {
    expect(CORE_TYPE_NAMES.sort()).toEqual(Object.keys(TYPE_SAMPLES).sort())
  })

  CORE_TYPE_NAMES.forEach((testTypeName) => {
    // eslint-disable-next-line jest/valid-title
    describe(testTypeName, () => {
      const cases = Object.keys(TYPE_SAMPLES).reduce(
        (acc, sampleTypeName) => [
          ...acc,
          ...TYPE_SAMPLES[sampleTypeName].map((value) => [
            testTypeName,
            value,
            testTypeName === sampleTypeName ? undefined : TypeError,
          ]),
        ],
        []
      )

      testCases(cases, validateType)
    })
  })
})

describe('typing(types)', () => {
  test('types is required', () => {
    expect(() => typing(undefined)).toThrow(TypeError)
  })

  const describeIsType = (isType) => {
    describe('isType(typeName, value)', () => {
      testCases(
        [
          ['alphaNumericString', 'abc', true],
          ['alphaNumericString', 'abc123', true],
          ['alphaNumericString', 'abc123-', false],
          ['alphaNumericString', 123, false],
          ['string', 'abc123-', true],
          ['string', 123, false],
          ['number', 123, true],
          [
            'unknown_type',
            123,
            new Error('Invalid expectedType: unknown_type'),
          ],
          [true, 123, new Error('Invalid expectedType: true')],
        ],
        isType
      )
    })
  }

  const describeGetType = (getType) => {
    describe('getType(value)', () => {
      testCases(
        [
          ['abc', 'alphaNumericString'],
          ['abc123', 'alphaNumericString'],
          ['abc123-', 'string'],
          [123, 'number'],
          [true, new Error('Could not identify value type: true')],
        ],
        getType
      )
    })
  }

  const describeValidateType = (validateType) => {
    describe('validateType(type, value)', () => {
      testCases(
        [
          ['alphaNumericString', 'abc', undefined],
          ['alphaNumericString', 'abc123', undefined],
          ['alphaNumericString', 'abc123-', TypeError],
          ['alphaNumericString', 123, TypeError],
          ['string', 'abc123-', undefined],
          ['string', 123, TypeError],
          ['number', 123, undefined],
          [
            'unknown_type',
            123,
            new Error('Invalid expectedType: unknown_type'),
          ],
        ],
        validateType
      )
    })
  }

  describe('typing(types: TypeMap)', () => {
    const types = {
      alphaNumericString: (value) =>
        typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value),
      string: (value) => typeof value === 'string',
      number: (value) => typeof value === 'number',
    }

    const { isType, getType, validateType } = typing(types)

    describeIsType(isType)
    describeGetType(getType)
    describeValidateType(validateType)
  })

  describe('typing(types: TypeAlternatives)', () => {
    const types = [
      [
        (value) => typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value),
        'alphaNumericString',
      ],
      [(value) => typeof value === 'string', 'string'],
      [(value) => typeof value === 'number', 'number'],
    ]

    const { isType, getType, validateType } = typing(types)

    describeIsType(isType)
    describeGetType(getType)
    describeValidateType(validateType)
  })
})
