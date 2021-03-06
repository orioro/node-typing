import { isPlainObject } from 'is-plain-object'
import { cascadeFind, test } from '@orioro/cascade'
import deepEqual from 'deep-equal'

import { castTypeSpec } from './typeSpec'

import {
  TypeSpec,
  ANY_TYPE,
  SINGLE_TYPE,
  ONE_OF_TYPES,
  ENUM_TYPE,
  INDEFINITE_ARRAY_OF_TYPE,
  INDEFINITE_OBJECT_OF_TYPE,
  TUPLE_TYPE,
  OBJECT_TYPE,
  TypeAlternative,
  TypeAlternatives,
  TypeMap,
} from './types'

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

const _isType = (
  typeMap: TypeMap,
  expectedType: TypeSpec,
  value: any
): boolean => {
  const _expectedType = castTypeSpec(expectedType)

  if (_expectedType === null) {
    throw new Error(`Invalid expectedType: ${expectedType}`)
  }

  switch (_expectedType.specType) {
    case ANY_TYPE:
      return true
    case SINGLE_TYPE: {
      const typeTest = typeMap[_expectedType.type]

      if (typeof typeTest !== 'function') {
        throw new Error(`Invalid expectedType: ${expectedType}`)
      }

      return typeTest(value)
    }
    case ONE_OF_TYPES: {
      return _expectedType.types.some((_candidateType) =>
        _isType(typeMap, _candidateType, value)
      )
    }
    case ENUM_TYPE: {
      return _expectedType.values.some((expectedValue) =>
        deepEqual(expectedValue, value, { strict: true })
      )
    }
    case INDEFINITE_ARRAY_OF_TYPE: {
      return (
        Array.isArray(value) &&
        value.every((item) => _isType(typeMap, _expectedType.itemType, item))
      )
    }
    case INDEFINITE_OBJECT_OF_TYPE: {
      return (
        isPlainObject(value) &&
        Object.keys(value).every((property) =>
          _isType(typeMap, _expectedType.propertyType, value[property])
        )
      )
    }
    case TUPLE_TYPE: {
      return (
        Array.isArray(value) &&
        value.length === _expectedType.items.length &&
        _expectedType.items.every((itemType, index) =>
          _isType(typeMap, itemType, value[index])
        )
      )
    }
    case OBJECT_TYPE: {
      const expectedProperties = Object.keys(_expectedType.properties)

      return (
        isPlainObject(value) &&
        Object.keys(value).every((property) =>
          expectedProperties.includes(property)
        ) &&
        expectedProperties.every((property) =>
          _isType(typeMap, _expectedType.properties[property], value[property])
        )
      )
    }
    default: {
      throw new Error(`Invalid expectedType: ${expectedType}`)
    }
  }
}

const _validateType = (
  typeMap: TypeMap,
  expectedType: TypeSpec,
  value: any
): void => {
  if (!_isType(typeMap, expectedType, value)) {
    throw new TypeError(
      `Expected \`${
        Array.isArray(expectedType) ? expectedType.join(' | ') : expectedType
      }\` but got \`${getType(value)}\`: ${JSON.stringify(value)}`
    )
  }
}

const _getType = (typeAlternatives: TypeAlternatives, value: any): string => {
  const type = cascadeFind(test, typeAlternatives, value)

  if (type === undefined) {
    throw new Error(`Could not identify value type: ${value}`)
  }

  return type
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
  const validateType = _validateType.bind(null, _typeMap)

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
