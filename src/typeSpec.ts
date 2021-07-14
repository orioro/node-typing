import { isPlainObject } from 'is-plain-object'
import {
  PlainObject,
  ANY_TYPE_SPEC,
  AnyTypeSpec,
  SINGLE_TYPE_SPEC,
  SingleTypeSpec,
  SingleTypeSpecShorthand,
  ONE_OF_TYPES_SPEC,
  OneOfTypesSpec,
  OneOfTypesSpecShorthand,
  ENUM_TYPE_SPEC,
  EnumTypeSpec,
  INDEFINITE_ARRAY_OF_TYPE_SPEC,
  IndefiniteArrayOfTypeSpec,
  INDEFINITE_OBJECT_OF_TYPE_SPEC,
  IndefiniteObjectOfTypeSpec,
  TUPLE_TYPE_SPEC,
  TupleTypeSpec,
  OBJECT_TYPE_SPEC,
  ObjectTypeSpec,
  ObjectTypeSpecShorthand,
  TypeSpec,
  NonShorthandTypeSpec,
} from './types'

/**
 * Constant to be used to express that any type is allowed:
 * - `isType` always returns true
 * - `validateType` never throws
 *
 * @function anyType
 * @param {Object} [metadata]
 * @type {AnyTypeSpec}
 */
export const anyType = ({
  not,
  ...metadata
}: {
  not?: TypeSpec
  [key: string]: any
} = {}): AnyTypeSpec =>
  not
    ? {
        ...metadata,
        not: castTypeSpec(not),
        specType: ANY_TYPE_SPEC,
      }
    : {
        ...metadata,
        specType: ANY_TYPE_SPEC,
      }

/**
 * @function singleType
 * @param {String} type
 * @param {Object} [metadata]
 * @returns {SingleTypeSpec}
 */
export const singleType = (
  type: SingleTypeSpecShorthand,
  metadata: PlainObject = {}
): SingleTypeSpec => ({
  ...metadata,
  specType: SINGLE_TYPE_SPEC,
  type,
})

/**
 * @function oneOfTypes
 * @param {TypeSpec[]} types
 * @param {Object} [metadata]
 * @returns {OneOfTypesSpec}
 */
export const oneOfTypes = (
  types: OneOfTypesSpecShorthand,
  metadata: PlainObject = {}
): OneOfTypesSpec => ({
  ...metadata,
  specType: ONE_OF_TYPES_SPEC,
  types: types.map(castTypeSpec),
})

/**
 * @function enumType
 * @param {*[]} values
 * @param {Object} [metadata]
 * @returns {EnumTypeSpec}
 */
export const enumType = (
  values: any[],
  metadata: PlainObject = {}
): EnumTypeSpec => ({
  ...metadata,
  specType: ENUM_TYPE_SPEC,
  values,
})

/**
 * @function indefiniteArrayOfType
 * @param {TypeSpec} itemType
 * @param {Object} [metadata]
 * @returns {IndefiniteArrayOfTypeSpec}
 */
export const indefiniteArrayOfType = (
  itemType: TypeSpec,
  metadata: PlainObject = {}
): IndefiniteArrayOfTypeSpec => ({
  ...metadata,
  specType: INDEFINITE_ARRAY_OF_TYPE_SPEC,
  itemType: castTypeSpec(itemType),
})

/**
 * @function indefiniteObjectOfType
 * @param {TypeSpec} propertyType
 * @param {Object} [metadata]
 * @returns {IndefiniteObjectOfTypeSpec}
 */
export const indefiniteObjectOfType = (
  propertyType: TypeSpec,
  metadata: PlainObject = {}
): IndefiniteObjectOfTypeSpec => ({
  ...metadata,
  specType: INDEFINITE_OBJECT_OF_TYPE_SPEC,
  propertyType: castTypeSpec(propertyType),
})

/**
 * @function tupleType
 * @param {TypeSpec[]} items
 * @param {Object} [metadata]
 * @returns {TupleTypeSpec}
 */
export const tupleType = (
  items: TypeSpec[],
  metadata: PlainObject = {}
): TupleTypeSpec => ({
  ...metadata,
  specType: TUPLE_TYPE_SPEC,
  items: items.map(castTypeSpec),
})

/**
 * @function objectType
 * @param {Object} properties Types of each of the properties
 * @param {Object} [metadata]
 * @returns {ObjectTypeSpec}
 */
export const objectType = (
  properties: ObjectTypeSpecShorthand,
  { unknownProperties, ...metadata }: PlainObject = {}
): ObjectTypeSpec => ({
  ...metadata,
  specType: OBJECT_TYPE_SPEC,
  properties: Object.keys(properties).reduce(
    (acc, property) => ({
      ...acc,
      [property]: castTypeSpec(properties[property]),
    }),
    {}
  ),
  unknownProperties: unknownProperties
    ? unknownProperties === true
      ? true
      : castTypeSpec(unknownProperties)
    : false,
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
 * @param {Object} [metadata]
 * @returns {TypeSpec | null}
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const castTypeSpec = (candidateTypeSpec: any): NonShorthandTypeSpec => {
  if (isPlainObject(candidateTypeSpec)) {
    if (typeof candidateTypeSpec.specType === 'string') {
      return candidateTypeSpec
    } else {
      return objectType(candidateTypeSpec)
    }
  } else if (Array.isArray(candidateTypeSpec)) {
    return oneOfTypes(candidateTypeSpec)
  } else if (typeof candidateTypeSpec === 'string') {
    return candidateTypeSpec === ANY_TYPE_SPEC
      ? anyType()
      : singleType(candidateTypeSpec)
  } else {
    throw new Error(
      `Invalid typeSpec: \`${JSON.stringify(candidateTypeSpec)}\``
    )
  }
}

export const stringifyTypeSpec = (typeSpec: TypeSpec): string => {
  const _typeSpec = castTypeSpec(typeSpec)

  switch (_typeSpec.specType) {
    case ANY_TYPE_SPEC:
      return _typeSpec.not === undefined
        ? 'any'
        : `any!${stringifyTypeSpec(_typeSpec.not)}`
    case SINGLE_TYPE_SPEC:
      return _typeSpec.type
    case ONE_OF_TYPES_SPEC:
      return _typeSpec.types.map(stringifyTypeSpec).join(' | ')
    case ENUM_TYPE_SPEC:
      return `${_typeSpec.values.join(', ')}`
    case INDEFINITE_ARRAY_OF_TYPE_SPEC:
      return `${stringifyTypeSpec(_typeSpec.itemType)}[]`
    case INDEFINITE_OBJECT_OF_TYPE_SPEC:
      return `${stringifyTypeSpec(_typeSpec.propertyType)}{}`
    case TUPLE_TYPE_SPEC:
      return `[${_typeSpec.items.map(stringifyTypeSpec).join(', ')}]`
    case OBJECT_TYPE_SPEC: {
      return `{ ${Object.keys(_typeSpec.properties).join(', ')} }`
    }
    default:
      return Object.prototype.toString.call(typeSpec)
  }
}
