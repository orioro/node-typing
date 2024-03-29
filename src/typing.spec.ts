import { testCases, fnCallLabel, variableName } from '@orioro/jest-util'
import { getType, validateType, CORE_TYPES, typing } from './typing'
import {
  anyType,
  tupleType,
  enumType,
  indefiniteArrayOfType,
  indefiniteObjectOfType,
  objectType,
} from './typeSpec'
import { TypeAlternatives } from './types'

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
  bigint: [BigInt(9007199254740991)],
  date: [new Date()],
  symbol: [Symbol(), Symbol('symbolname')],
  map: [new Map()],
  weakmap: [new WeakMap()],
  set: [new Set()],
  weakset: [new WeakSet()],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  promise: [new Promise(() => {})],
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

describe('validateType(enum, value)', () => {
  const expectedType = enumType([
    'SOME_STRING',
    10,
    [1, 2, 3],
    { key1: 'value1', key2: 'value2' },
  ])

  testCases(
    [
      [expectedType, 'SOME_STRING', undefined],
      [expectedType, 'ANOTHER_STR', TypeError],
      [expectedType, 10, undefined],
      [expectedType, 11, TypeError],
      [expectedType, [1, 2, 3], undefined],
      [expectedType, [1, 2, 3, 4], TypeError],
      [expectedType, { key1: 'value1', key2: 'value2' }, undefined],
      [expectedType, { key1: 'value1' }, TypeError],
    ],
    validateType
  )
})

describe('validateType(objectTypeSpec, value)', () => {
  const _renderLabel = (args, result) =>
    fnCallLabel(
      'validateType',
      [variableName('objectTypeSpec'), ...args],
      result
    )

  describe('valid situations', () => {
    const objectTypeSpec = {
      key1: 'string',
      key2: ['number', 'string'],
    }
    testCases(
      [
        [{ key1: 'str1', key2: 'str2' }, undefined],
        [{ key1: 'str1', key2: 123 }, undefined],
      ],
      validateType.bind(null, objectTypeSpec),
      _renderLabel
    )
  })

  describe('simple situations', () => {
    const objectTypeSpec = {
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
      validateType.bind(null, objectTypeSpec),
      _renderLabel
    )
  })

  describe('only allow known keys', () => {
    const objectTypeSpec = {
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

        // Unknown key3
        [{ key1: 'str1', key2: 'str2', key3: 'str3' }, TypeError],
      ],
      validateType.bind(null, objectTypeSpec),
      _renderLabel
    )
  })

  describe('allow unknown properties', () => {
    describe('unknownProperties: true', () => {
      const objectTypeSpec = objectType(
        {
          key1: 'string',
          key2: ['number', 'string'],
        },
        {
          unknownProperties: true,
        }
      )

      testCases(
        [
          // Control
          [{ key1: 'str1', key2: 123 }, undefined],

          // Missing key2
          [{ key1: 'str1' }, TypeError],

          // Missing key1 and key2
          [{}, TypeError],

          // Unknown key3
          [{ key1: 'str1', key2: 'str2', key3: 'str3' }, undefined],
        ],
        validateType.bind(null, objectTypeSpec),
        _renderLabel
      )
    })

    describe('unknownProperties: TypeSpec', () => {
      const objectTypeSpec = objectType(
        {
          key1: 'string',
          key2: ['number', 'string'],
        },
        {
          unknownProperties: 'string',
        }
      )

      testCases(
        [
          // Control
          [{ key1: 'str1', key2: 123 }, undefined],

          // Missing key2
          [{ key1: 'str1' }, TypeError],

          // Missing key1 and key2
          [{}, TypeError],

          // Unknown key3 - matches unknownProperties type
          [{ key1: 'str1', key2: 'str2', key3: 'str3' }, undefined],

          // Unknown key3 - does not match unknownProperties type
          [{ key1: 'str1', key2: 'str2', key3: 8 }, TypeError],
        ],
        validateType.bind(null, objectTypeSpec),
        _renderLabel
      )
    })
  })

  describe('allow undefined', () => {
    const objectTypeSpec = {
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
      (value) => validateType([objectTypeSpec, 'undefined'], value),
      (args, result) =>
        fnCallLabel(
          'validateType',
          [[variableName('objectTypeSpec'), 'undefined'], ...args],
          result
        )
    )
  })

  describe('deep nesting', () => {
    const objectTypeSpec = {
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
      validateType.bind(null, objectTypeSpec),
      _renderLabel
    )
  })

  describe('custom object constructors', () => {
    const objectShape = {
      key1: 'string',
      key2: ['number', 'string'],
    }

    function ConstructorA(props) {
      Object.assign(this, props)
    }

    function ConstructorB(props) {
      Object.assign(this, props)
    }

    const _label = (args, result) =>
      fnCallLabel(
        'validateType',
        [variableName('objectTypeSpec'), ...args],
        result
      )

    describe('plain-object (default)', () => {
      testCases(
        [
          [{ key1: '123', key2: 123 }, undefined],
          [new ConstructorA({ key1: '123', key2: 123 }), TypeError],
          [new ConstructorB({ key1: '123', key2: 123 }), TypeError],
          // Invalid key1
          [{ key1: 123, key2: 123 }, TypeError],
          [new ConstructorA({ key1: 123, key2: 123 }), TypeError],
        ],
        (value) =>
          validateType(
            objectType(objectShape, {
              instanceOf: 'plain-object',
            }),
            value
          ),
        _label
      )
    })

    describe('any', () => {
      testCases(
        [
          [{ key1: '123', key2: 123 }, undefined],
          [new ConstructorA({ key1: '123', key2: 123 }), undefined],
          [new ConstructorB({ key1: '123', key2: 123 }), undefined],
          // Invalid key1
          [{ key1: 123, key2: 123 }, TypeError],
          [new ConstructorA({ key1: 123, key2: 123 }), TypeError],
        ],
        (value) =>
          validateType(
            objectType(objectShape, {
              instanceOf: 'any',
            }),
            value
          ),
        _label
      )
    })

    describe('specific constructor Function', () => {
      testCases(
        [
          [{ key1: '123', key2: 123 }, TypeError],
          [new ConstructorA({ key1: '123', key2: 123 }), undefined],
          [new ConstructorB({ key1: '123', key2: 123 }), TypeError],
          // Invalid key1
          [{ key1: 123, key2: 123 }, TypeError],
          [new ConstructorA({ key1: 123, key2: 123 }), TypeError],
        ],
        (value) =>
          validateType(
            objectType(objectShape, {
              instanceOf: ConstructorA,
            }),
            value
          ),
        _label
      )
    })
  })
})

describe('validateType(tupleType, value)', () => {
  describe('simple tuple', () => {
    const expectedType = tupleType(['string', 'number'])

    testCases(
      [
        [expectedType, ['str', 8], undefined],
        [expectedType, ['str', 'str'], TypeError],
        [expectedType, ['str'], TypeError],
        [expectedType, [undefined, 8], TypeError],
      ],
      validateType
    )
  })
})

describe('validateType(indefiniteArrayOfType, value)', () => {
  describe('array of single type', () => {
    const expectedType = indefiniteArrayOfType('string')

    testCases(
      [
        [expectedType, ['str1', 'str2', 'str3'], undefined],
        [expectedType, ['str1', 'str2', ''], undefined],
        [expectedType, ['str1'], undefined],
        [expectedType, [], undefined],
        [expectedType, ['str', 8], TypeError],
        [expectedType, 'str', TypeError],
        [expectedType, { '0': 'str1', '1': 'str2' }, TypeError],
      ],
      validateType
    )
  })

  describe('array of one-of types', () => {
    const expectedType = indefiniteArrayOfType(['string', 'number'])

    testCases(
      [
        [expectedType, ['str1', 'str2', 'str3'], undefined],
        [expectedType, ['str1', 'str2', 5], undefined],
        [expectedType, [1, 5], undefined],
        [expectedType, [], undefined],
        [expectedType, [1, 5, 'str', true], TypeError],
      ],
      validateType
    )
  })
})

describe('validateType(indefiniteObjectOfType, value)', () => {
  describe('object w/ any number of properties whose value are all strings', () => {
    const expectedType = indefiniteObjectOfType('string')

    testCases(
      [
        [expectedType, { key: 'str' }, undefined],
        [expectedType, { key1: 'str1', key2: 'str2' }, undefined],
        [expectedType, {}, undefined],
        [expectedType, { key1: 'str1', key2: 8 }, TypeError],
      ],
      validateType
    )
  })

  describe('nested objects', () => {
    const expectedType = indefiniteObjectOfType({
      kind: 'string',
      numeric: 'number',
      numericOrText: ['number', 'string'],
    })

    testCases(
      [
        [
          expectedType,
          {
            key1: { kind: 'kind1', numeric: 10, numericOrText: 'text' },
            key2: { kind: 'kind2', numeric: 60, numericOrText: 9 },
          },
          undefined,
        ],
        [expectedType, {}, undefined],
        [
          expectedType,
          {
            key1: 'string',
            key2: { kind: 'kind2', numeric: 60, numericOrText: 9 },
          },
          TypeError,
        ],
        [
          expectedType,
          {
            key1: { kind: 9, numeric: 10, numericOrText: 'text' },
            key2: { kind: 'kind2', numeric: 60, numericOrText: 9 },
          },
          TypeError,
        ],
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

  describe('anyType({ not: TypeSpec })', () => {
    testCases(
      [
        [anyType({ not: 'string' }), 1, undefined],
        [anyType({ not: 'string' }), 'str', TypeError],
        [
          anyType({ not: tupleType(['string', 'number']) }),
          ['str', true],
          undefined,
        ],
        [
          anyType({ not: tupleType(['string', 'number']) }),
          ['str', 19],
          TypeError,
        ],
      ],
      validateType
    )
  })
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
    function ConstructorA() {} // eslint-disable-line @typescript-eslint/no-empty-function
    expect(getType(new ConstructorA())).toEqual(undefined)
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Argument of type 'undefined' is not assignable to parameter of type 'TypeMap | TypeAlternatives'.
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
          ['unknown_type', 123, new Error('Invalid type: unknown_type')],
          [true, 123, new Error('Invalid typeSpec: `true`')],
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
          [true, undefined],
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
          ['unknown_type', 123, new Error('Invalid type: unknown_type')],
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
    const types: TypeAlternatives = [
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

describe('error cases', () => {
  const expectedType = { specType: 'unknown_spec_type' }

  testCases(
    [[expectedType, 'some-value', new Error(`Invalid type: ${expectedType}`)]],
    validateType
  )
})
