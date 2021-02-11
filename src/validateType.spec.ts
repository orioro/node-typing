import { validateType } from './validateType'

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
      [[['array', 'string'], ['array-item-1', 'array-item-2']], undefined],
      [[['array', 'string'], 'Some string'], undefined],
      [[['array', 'string'], undefined], TypeError],
    ]

    expectations.forEach(([args, result]) => {
      if (result === TypeError) {
        expect(() => validateType(args[0], args[1])).toThrow(TypeError)
      } else {
        expect(validateType(args[0], args[1])).toEqual(result)
      }
    })
  })
})
