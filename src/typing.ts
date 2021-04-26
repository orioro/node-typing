import { isPlainObject } from 'is-plain-object'

import { TypeMap, TypeAlternative, TypeAlternatives, TypeSpec } from './types'

import { _isType } from './isType'
import { _validateType } from './validateType'
import { _getType } from './getType'

/**
 * @todo typing Study Blob, File, DOMElement, etc support.
 * @constant {TypeMap} CORE_TYPES
 */
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
  promise: (value) => value instanceof Promise,
}

/**
 * @function typing
 * @param {TypeAlternatives | TypeMap} types Definition of the types to be considered
 * @returns {{ isType, validateType, getType }}
 */
export const typing = (
  types: TypeAlternatives | TypeMap
): {
  getType: (value: any) => string
  isType: (expectedType: TypeSpec, value: any) => boolean
  validateType: (expectedType: TypeSpec, value: any) => void
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
   * @param {TypeSpec} expectedType Type or array of types that are allowed for the
   *                                    given value. Use `null` and `undefined` to allow
   *                                    these values
   * @param {*} value The value whose type is being tested
   * @returns {boolean}
   */
  const isType = _isType.bind(null, _typeMap)

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
  const validateType = _validateType.bind(null, _typeMap, _typeAlternatives)

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
  const getType = _getType.bind(null, _typeAlternatives)

  return {
    isType,
    validateType,
    getType,
  }
}

const { isType, validateType, getType } = typing(CORE_TYPES)

export { getType, isType, validateType }
