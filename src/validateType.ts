import { isPlainObject } from 'is-plain-object'
import { cascadeFind, test, Criteria } from '@orioro/cascade'

export type TypeAny = 'any'

export type TypeName = string

export type ExpectedType =
  | TypeAny
  | TypeName
  | ExpectedTypeList
  | ExpectedTypeMap

export type ExpectedTypeList = ExpectedType[]

export type ExpectedTypeMap = {
  [key: string]: ExpectedType
}

export type TypeAlternative = [Criteria, TypeName]
export type TypeAlternatives = TypeAlternative[]
export type TypeMap = {
  [type: string]: Criteria
}

export const TYPE_ANY = 'any'

export const CORE_TYPES: TypeMap = {
  string: (value) => typeof value === 'string',
  regexp: (value) => value instanceof RegExp,
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN
  number: (value) => typeof value === 'number' && !Number.isNaN(value),
  nan: (value) => Number.isNaN(value),
  null: (value) => value === null,
  undefined: (value) => value === undefined,
  boolean: (value) => typeof value === 'boolean',
  function: (value) => typeof value === 'function',
  array: (value) => Array.isArray(value),
  object: isPlainObject,
  bigint: (value) => typeof value === 'bigint',
  date: (value) => value instanceof Date,
  symbol: (value) => typeof value === 'symbol',
  map: (value) => value instanceof Map,
  weakmap: (value) => value instanceof WeakMap,
  set: (value) => value instanceof Set,
  weakset: (value) => value instanceof WeakSet,
}

/**
 * @function typeValidator
 * @param {TypeAlternatives | TypeMap} types Definition of the types to be considered
 * @returns {{ isType, validateType, getType }}
 */
export const typeValidator = (
  types: TypeAlternatives | TypeMap
): {
  getType: (value: any) => string
  isType: (expectedType: ExpectedType, value: any) => boolean
  validateType: (expectedType: ExpectedType, value: any) => void
} => {
  if (!Array.isArray(types) && !isPlainObject(types)) {
    throw new TypeError(`Expected types to be array or object, got: ${types}`)
  }

  //
  // TypeAlternatives structure is better suited for `getType(value)`
  // as it is an array with explicit order
  //
  const _typeAlternatives: TypeAlternatives = Array.isArray(types)
    ? types
    : Object.keys(types).map(
        (type: string): TypeAlternative => [types[type], type]
      )

  //
  // TypeMap structure is better suited for checking whether a value
  // is of a given type, as it allows immediate access through
  // type name
  //
  const _typeMap: TypeMap = _typeAlternatives.reduce(
    (acc, [test, name]) => ({
      ...acc,
      [name]: test,
    }),
    {}
  )

  /**
   * @function isType
   * @param {ExpectedType} expectedType Type or array of types that are allowed for the
   *                                    given value. Use `null` and `undefined` to allow
   *                                    these values
   * @param {*} value The value whose type is being tested
   * @returns {boolean}
   */
  const isType = (expectedType: ExpectedType, value: any): boolean => {
    if (Array.isArray(expectedType)) {
      return (expectedType as ExpectedType[]).some((_nestedExpectedType) =>
        isType(_nestedExpectedType, value)
      )
    } else if (isPlainObject(expectedType)) {
      const expectedKeys = Object.keys(expectedType)

      return (
        (isPlainObject(value) || Array.isArray(value)) &&
        Object.keys(value).every((valueKey) =>
          expectedKeys.includes(valueKey)
        ) &&
        expectedKeys.every((expectedKey) =>
          isType(expectedType[expectedKey], value[expectedKey])
        )
      )
    } else if (typeof expectedType === 'string') {
      if (expectedType === TYPE_ANY) {
        return true
      }

      const typeTest = _typeMap[expectedType as string]

      if (typeof typeTest !== 'function') {
        throw new Error(`Invalid expectedType: ${expectedType}`)
      }

      return typeTest(value)
    } else {
      throw new Error(`Invalid expectedType: ${expectedType}`)
    }
  }

  /**
   * If typing is invalid, throws TypeError.
   * Returns nothing (undefined) otherwise.
   *
   * @function validateType
   * @param {string[] | string} expectedType Type or array of types that are allowed for the
   *                                         given value. Use `null` and `undefined` to allow
   *                                         these values
   * @param {*} value The value whose type is being tested
   * @returns {undefined}
   * @throws {TypeError}
   */
  const validateType = (expectedType: ExpectedType, value: any): void => {
    if (!isType(expectedType, value)) {
      throw new TypeError(
        `Expected \`${
          Array.isArray(expectedType) ? expectedType.join(' | ') : expectedType
        }\` but got \`${getType(value)}\`: ${JSON.stringify(value)}`
      )
    }
  }

  /**
   * @function getType
   * @param {*} value
   * @returns {string} type Possible values for default configuration:
   *   - string
   *   - regexp
   *   - number
   *   - bigint
   *   - nan
   *   - null
   *   - undefined
   *   - boolean
   *   - function
   *   - object
   *   - array
   *   - date
   *   - symbol
   *   - map
   *   - set
   *   - weakmap
   *   - weakset
   */
  const getType = (value: any): string => {
    const type = cascadeFind(test, _typeAlternatives, value)

    if (type === undefined) {
      throw new Error(`Could not identify value type: ${value}`)
    }

    return type
  }

  return {
    isType,
    validateType,
    getType,
  }
}

const { isType, validateType, getType } = typeValidator(CORE_TYPES)

export { getType, isType, validateType }
