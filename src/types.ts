import { Criteria } from '@orioro/cascade'

export type PlainObject = {
  [key: string]: any
}

export type SpecType =
  | 'any'
  | 'single'
  | 'one-of'
  | 'indefinite-array-of'
  | 'indefinite-object-of'
  | 'tuple'
  | 'object'

export type TypeName = string

export const ANY_TYPE = 'any'
export type AnyTypeSpec = PlainObject & {
  specType: 'any'
  not?: NonShorthandTypeSpec
}
export type AnyTypeShorthandSpec = 'any'

export const SINGLE_TYPE = 'single'
export type SingleTypeSpec = PlainObject & {
  specType: 'single'
  type: string
}
export type SingleTypeSpecShorthand = TypeName

export const ONE_OF_TYPES = 'one-of'
export type OneOfTypesSpec = PlainObject & {
  specType: 'one-of'
  types: NonShorthandTypeSpec[]
}
export type OneOfTypesSpecShorthand = TypeSpec[]

export const ENUM_TYPE = 'enum'
export type EnumTypeSpec = PlainObject & {
  specType: 'enum'
  values: any[]
}

export const INDEFINITE_ARRAY_OF_TYPE = 'indefinite-array-of'
export type IndefiniteArrayOfTypeSpec = PlainObject & {
  specType: 'indefinite-array-of'
  itemType: NonShorthandTypeSpec
}

export const INDEFINITE_OBJECT_OF_TYPE = 'indefinite-object-of'
export type IndefiniteObjectOfTypeSpec = PlainObject & {
  specType: 'indefinite-object-of'
  propertyType: NonShorthandTypeSpec
}

export const TUPLE_TYPE = 'tuple'
export type TupleTypeSpec = PlainObject & {
  specType: 'tuple'
  items: NonShorthandTypeSpec[]
}

export const OBJECT_TYPE = 'object'
export type ObjectTypeSpec = PlainObject & {
  specType: 'object'
  properties: {
    [key: string]: NonShorthandTypeSpec
  }
}
export type ObjectTypeSpecShorthand = {
  [key: string]: TypeSpec
}

export type TypeSpec =
  | AnyTypeSpec
  | SingleTypeSpec
  | SingleTypeSpecShorthand
  | OneOfTypesSpec
  | OneOfTypesSpecShorthand
  | EnumTypeSpec
  | IndefiniteArrayOfTypeSpec
  | IndefiniteObjectOfTypeSpec
  | TupleTypeSpec
  | ObjectTypeSpec
  | ObjectTypeSpecShorthand

export type NonShorthandTypeSpec =
  | AnyTypeSpec
  | SingleTypeSpec
  | OneOfTypesSpec
  | EnumTypeSpec
  | IndefiniteArrayOfTypeSpec
  | IndefiniteObjectOfTypeSpec
  | TupleTypeSpec
  | ObjectTypeSpec

export type TypeAlternative = [Criteria, TypeName]
export type TypeAlternatives = TypeAlternative[]
export type TypeMap = {
  [type: string]: Criteria
}
