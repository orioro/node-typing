import { getType, validateType } from './validateType'

describe('validateType(expectedTypes, value)', () => {
  test('validateType(expectedTypes, value)', () => {
    const expectations = [
      [['string', 'Some string'], undefined],
      [['string', 9], TypeError],
      [['string', undefined], TypeError],
      [[['string', 'undefined'], 'Some string'], undefined],
      [[['string', 'undefined'], undefined], undefined],
      [[['string', 'number'], undefined], TypeError],

      [['array', []], undefined],
      [
        [
          ['array', 'string'],
          ['array-item-1', 'array-item-2'],
        ],
        undefined,
      ],
      [[['array', 'string'], 'Some string'], undefined],
      [[['array', 'string'], undefined], TypeError],
    ]

    expectations.forEach(([args, result]) => {
      if (result === TypeError) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(() => validateType(args[0], args[1])).toThrow(TypeError)
      } else {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(validateType(args[0], args[1])).toEqual(result)
      }
    })
  })

  test('validateType(objectTypeMap, value)', () => {
    const type = { key1: 'string', key2: ['number', 'string'] }

    expect(
      validateType(type, {
        key1: 'str1',
        key2: 'str2',
      })
    ).toEqual(undefined)

    expect(
      validateType(type, {
        key1: 'str1',
        key2: 123,
      })
    ).toEqual(undefined)

    expect(() => {
      validateType(type, {
        key1: 1,
        key2: 'str2',
      })
    }).toThrow(TypeError)

    expect(() => {
      validateType(type, {
        key1: 'str1',
        key2: true,
      })
    }).toThrow(TypeError)

    expect(() => {
      validateType(type, 'str1')
    }).toThrow(TypeError)

    expect(() => {
      validateType(type, [])
    }).toThrow(TypeError)
  })
})

describe('getType(value)', () => {
  test('string', () => expect(getType('some string')).toEqual('string'))
  test('regexp', () => {
    expect(getType(/^regexp$/)).toEqual('regexp')
    expect(getType(new RegExp('^regexp$'))).toEqual('regexp')
  })
  test('number', () => expect(getType(9)).toEqual('number'))
  test('bigint', () => expect(getType(9n)).toEqual('bigint'))
  test('nan', () => expect(getType(NaN)).toEqual('nan'))
  test('null', () => expect(getType(null)).toEqual('null'))
  test('undefined', () => expect(getType(undefined)).toEqual('undefined'))
  test('boolean', () => {
    expect(getType(false)).toEqual('boolean')
    expect(getType(true)).toEqual('boolean')
  })
  test('function', () => {
    function a() {} // eslint-disable-line @typescript-eslint/no-empty-function
    const b = () => {} // eslint-disable-line @typescript-eslint/no-empty-function

    expect(getType(a)).toEqual('function')
    expect(getType(b)).toEqual('function')
    expect(getType(function () {})).toEqual('function') // eslint-disable-line @typescript-eslint/no-empty-function
    expect(getType(() => {})).toEqual('function') // eslint-disable-line @typescript-eslint/no-empty-function
  })
  test('object {}', () => {
    expect(getType({})).toEqual('object')

    function ConstructorA() {} // eslint-disable-line @typescript-eslint/no-empty-function
    expect(getType(new ConstructorA())).toEqual('object')
  })
  test('array []', () => expect(getType([])).toEqual('array'))
  test('date', () => expect(getType(new Date())).toEqual('date'))
  test('symbol', () => expect(getType(Symbol())).toEqual('symbol'))
  test('map', () => expect(getType(new Map())).toEqual('map'))
  test('set', () => expect(getType(new Set())).toEqual('set'))
  test('weakmap', () => expect(getType(new WeakMap())).toEqual('weakmap'))
  test('weakset', () => expect(getType(new WeakSet())).toEqual('weakset'))
})
