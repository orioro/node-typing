import { isPlainObject } from 'is-plain-object'
import {
  ANY_TYPE,
  AnyTypeSpec,
  SINGLE_TYPE,
  SingleTypeSpec,
  SingleTypeSpecShorthand,
  ONE_OF_TYPES,
  OneOfTypesSpec,
  OneOfTypesSpecShorthand,
  ENUM_TYPE,
  EnumTypeSpec,
  INDEFINITE_ARRAY_OF_TYPE,
  IndefiniteArrayOfTypeSpec,
  INDEFINITE_OBJECT_OF_TYPE,
  IndefiniteObjectOfTypeSpec,
  TUPLE_TYPE,
  TupleTypeSpec,
  OBJECT_TYPE,
  ObjectTypeSpec,
  ObjectTypeSpecShorthand,
  TypeSpec,
  NonShorthandTypeSpec,
} from './types'

/**
 * @const {AnyTypeSpec} anyType
 * @type {AnyTypeSpec}
 */
export const anyType: AnyTypeSpec = {
  specType: ANY_TYPE,
}

/**
 * @function singleType
 * @param {String} type
 * @return {SingleTypeSpec}
 */
export const singleType = (type: SingleTypeSpecShorthand): SingleTypeSpec => ({
  specType: SINGLE_TYPE,
  type,
})

/**
 * @function oneOfTypes
 * @param {TypeSpec[]} types
 * @returns {OneOfTypesSpec}
 */
export const oneOfTypes = (
  types: OneOfTypesSpecShorthand[]
): OneOfTypesSpec => ({
  specType: ONE_OF_TYPES,
  types,
})

/**
 * @function enumType
 * @param {*[]} values
 * @returns {EnumTypeSpec}
 */
export const enumType = (values: any[]): EnumTypeSpec => ({
  specType: ENUM_TYPE,
  values,
})

/**
 * @function indefiniteArrayOfType
 * @param {TypeSpec} itemType
 * @returns {IndefiniteArrayOfTypeSpec}
 */
export const indefiniteArrayOfType = (
  itemType: TypeSpec
): IndefiniteArrayOfTypeSpec => ({
  specType: INDEFINITE_ARRAY_OF_TYPE,
  itemType,
})

/**
 * @function indefiniteObjectOfType
 * @param {TypeSpec} propertyType
 * @returns {IndefiniteObjectOfTypeSpec}
 */
export const indefiniteObjectOfType = (
  propertyType: TypeSpec
): IndefiniteObjectOfTypeSpec => ({
  specType: INDEFINITE_OBJECT_OF_TYPE,
  propertyType,
})

/**
 * @function tupleType
 * @param {TypeSpec[]} items
 * @returns {TupleTypeSpec}
 */
export const tupleType = (items: TypeSpec[]): TupleTypeSpec => ({
  specType: TUPLE_TYPE,
  items,
})

/**
 * @function objectType
 * @param {Object} properties Types of each of the properties
 * @returns {ObjectTypeSpec}
 */
export const objectType = (
  properties: ObjectTypeSpecShorthand
): ObjectTypeSpec => ({
  specType: OBJECT_TYPE,
  properties,
})

/**
 * Attempts to cast a value into a TypeSpec object:
 * - if an `ObjectTypeSpec`, simply return the value itself
 * - if a `string`, converts it into a `SingleTypeSpec`
 * - if an `array`, converts it into an `OneOfTypesSpec`
 * - if a `plain object`, converts it into an `ObjectTypeSpec`
 * - otherwise returns `null` upon casting failure
 *
 * @function castTypeSpec
 * @param {*} value
 * @returns {TypeSpec | null}
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const castTypeSpec = (value: any): NonShorthandTypeSpec | null => {
  if (isPlainObject(value)) {
    if (typeof value.specType === 'string') {
      return value
    } else {
      return objectType(value)
    }
  } else if (Array.isArray(value)) {
    return oneOfTypes(value)
  } else if (typeof value === 'string') {
    return value === ANY_TYPE ? anyType : singleType(value)
  } else {
    return null
  }
}
