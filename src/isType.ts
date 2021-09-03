import { isPlainObject } from 'is-plain-object'
import deepEqual from 'deep-equal'
import { castTypeSpec } from './typeSpec'

import { stringifyTypeSpec } from './typeSpec'
import {
  TypeSpec,
  ANY_TYPE_SPEC,
  SINGLE_TYPE_SPEC,
  ONE_OF_TYPES_SPEC,
  ENUM_TYPE_SPEC,
  INDEFINITE_ARRAY_OF_TYPE_SPEC,
  INDEFINITE_OBJECT_OF_TYPE_SPEC,
  TUPLE_TYPE_SPEC,
  OBJECT_TYPE_SPEC,
  ObjectTypeSpec,
  TypeMap,
} from './types'

const _objectMatchesShape = (
  typeMap: TypeMap,
  shape: ObjectTypeSpec,
  value: any
): boolean => {
  const expectedProperties = Object.keys(shape.properties)
  const unknownProperties = shape.unknownProperties

  const _expectedPropertiesMatch = expectedProperties.every((property) =>
    _isType(typeMap, shape.properties[property], value[property])
  )

  if (!unknownProperties) {
    return (
      _expectedPropertiesMatch &&
      Object.keys(value).every((property) =>
        expectedProperties.includes(property)
      )
    )
  } else {
    if (unknownProperties === true) {
      return _expectedPropertiesMatch
    } else {
      return (
        _expectedPropertiesMatch &&
        Object.keys(value).every((property) => {
          return (
            expectedProperties.includes(property) ||
            _isType(typeMap, unknownProperties, value[property])
          )
        })
      )
    }
  }
}

/**
 * @function _isType
 * @private
 */
export const _isType = (
  typeMap: TypeMap,
  expectedType: TypeSpec,
  value: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): boolean => {
  const _expectedType = castTypeSpec(expectedType)

  switch (_expectedType.specType) {
    case ANY_TYPE_SPEC:
      return _expectedType.not === undefined
        ? true
        : !_isType(typeMap, _expectedType.not, value)
    case SINGLE_TYPE_SPEC: {
      const typeTest = typeMap[_expectedType.type]

      if (typeof typeTest !== 'function') {
        throw new Error(`Invalid type: ${stringifyTypeSpec(_expectedType)}`)
      }

      return typeTest(value)
    }
    case ONE_OF_TYPES_SPEC: {
      return _expectedType.types.some((_candidateType) =>
        _isType(typeMap, _candidateType, value)
      )
    }
    case ENUM_TYPE_SPEC: {
      return _expectedType.values.some((expectedValue) =>
        deepEqual(expectedValue, value, { strict: true })
      )
    }
    case INDEFINITE_ARRAY_OF_TYPE_SPEC: {
      return (
        Array.isArray(value) &&
        value.every((item) => _isType(typeMap, _expectedType.itemType, item))
      )
    }
    case INDEFINITE_OBJECT_OF_TYPE_SPEC: {
      return (
        isPlainObject(value) &&
        Object.keys(value).every((property) =>
          _isType(typeMap, _expectedType.propertyType, value[property])
        )
      )
    }
    case TUPLE_TYPE_SPEC: {
      return (
        Array.isArray(value) &&
        value.length === _expectedType.items.length &&
        _expectedType.items.every((itemType, index) =>
          _isType(typeMap, itemType, value[index])
        )
      )
    }
    case OBJECT_TYPE_SPEC: {
      const isValidObject =
        typeof _expectedType['constructor'] === 'function'
          ? value instanceof _expectedType['constructor']
          : _expectedType['constructor'] === 'any'
          ? typeof value === 'object' && value !== null
          : isPlainObject(value)

      return isValidObject && _objectMatchesShape(typeMap, _expectedType, value)
    }
    default: {
      throw new Error(`Invalid type: ${stringifyTypeSpec(_expectedType)}`)
    }
  }
}
