# typing

```
npm install @orioro/typing
yarn add @orioro/typing
```

Simple type validation utilities. Meant for checking types of argument input
in microlibraries. For more complex use cases, such as object property or array
item validation, see either:
- `@orioro/expression` - https://github.com/orioro/node-expression
- `@orioro/validate` - https://github.com/orioro/node-validate
- `@orioro/schema` - https://github.com/orioro/schema

# API Docs

- [`anyType`](#anytype)
- [`singleType(type)`](#singletypetype)
- [`oneOfTypes(types)`](#oneoftypestypes)
- [`enumType(values)`](#enumtypevalues)
- [`indefiniteArrayOfType(itemType)`](#indefinitearrayoftypeitemtype)
- [`indefiniteObjectOfType(propertyType)`](#indefiniteobjectoftypepropertytype)
- [`tupleType(items)`](#tupletypeitems)
- [`objectType(properties)`](#objecttypeproperties)
- [`castTypeSpec(value)`](#casttypespecvalue)
- [`typing(types)`](#typingtypes)
- [`isType(expectedType, value)`](#istypeexpectedtype-value)
- [`validateType(expectedType, value)`](#validatetypeexpectedtype-value)
- [`getType(value)`](#gettypevalue)

##### `anyType`



##### `singleType(type)`

- `type` {String}

##### `oneOfTypes(types)`

- `types` {TypeSpec[]}
- Returns: {OneOfTypesSpec} 

##### `enumType(values)`

- `values` {*[]}
- Returns: {EnumTypeSpec} 

##### `indefiniteArrayOfType(itemType)`

- `itemType` {TypeSpec}
- Returns: {IndefiniteArrayOfTypeSpec} 

##### `indefiniteObjectOfType(propertyType)`

- `propertyType` {TypeSpec}
- Returns: {IndefiniteObjectOfTypeSpec} 

##### `tupleType(items)`

- `items` {TypeSpec[]}
- Returns: {TupleTypeSpec} 

##### `objectType(properties)`

- `properties` {Object}
- Returns: {ObjectTypeSpec} 

##### `castTypeSpec(value)`

Attempts to cast a value into a TypeSpec object:
- if an `ObjectTypeSpec`, simply return the value itself
- if a `string`, converts it into a `SingleTypeSpec`
- if an `array`, converts it into an `OneOfTypesSpec`
- if a `plain object`, converts it into an `ObjectTypeSpec`
- otherwise returns `null` upon casting failure

- `value` {*}
- Returns: {TypeSpec | null} 

##### `typing(types)`

- `types` {TypeAlternatives | TypeMap}
- Returns: {{ [isType](#istypeexpectedtype-value), [validateType](#validatetypeexpectedtype-value), [getType](#gettypevalue) }} 

##### `isType(expectedType, value)`

- `expectedType` {TypeSpec}
- `value` {*}
- Returns: {boolean} 

##### `validateType(expectedType, value)`

If typing is invalid, throws TypeError.
Returns nothing (undefined) otherwise.

- `expectedType` {string[] | string}
- `value` {*}
- Returns: {undefined} 

##### `getType(value)`

- `value` {*}
- Returns: `type` {string} Possible values for default configuration:
  - string
  - regexp
  - number
  - bigint
  - nan
  - null
  - undefined
  - boolean
  - function
  - object
  - array
  - date
  - symbol
  - map
  - set
  - weakmap
  - weakset
