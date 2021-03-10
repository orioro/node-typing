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

- [`_getType()`](#_gettype)
- [`_isType()`](#_istype)
- [`anyType(metadata)`](#anytypemetadata)
- [`singleType(type, metadata)`](#singletypetype-metadata)
- [`oneOfTypes(types, metadata)`](#oneoftypestypes-metadata)
- [`enumType(values, metadata)`](#enumtypevalues-metadata)
- [`indefiniteArrayOfType(itemType, metadata)`](#indefinitearrayoftypeitemtype-metadata)
- [`indefiniteObjectOfType(propertyType, metadata)`](#indefiniteobjectoftypepropertytype-metadata)
- [`tupleType(items, metadata)`](#tupletypeitems-metadata)
- [`objectType(properties, metadata)`](#objecttypeproperties-metadata)
- [`castTypeSpec(value, metadata)`](#casttypespecvalue-metadata)
- [`typing(types)`](#typingtypes)
- [`isType(expectedType, value)`](#istypeexpectedtype-value)
- [`validateType(expectedType, value)`](#validatetypeexpectedtype-value)
- [`getType(value)`](#gettypevalue)
- [`_validateType()`](#_validatetype)

##### `anyType(metadata)`

Constant to be used to express that any type is allowed:
- `isType` always returns true
- `validateType` never throws

- `metadata` {Object}

##### `singleType(type, metadata)`

- `type` {String}
- `metadata` {Object}
- Returns: {SingleTypeSpec} 

##### `oneOfTypes(types, metadata)`

- `types` {TypeSpec[]}
- `metadata` {Object}
- Returns: {OneOfTypesSpec} 

##### `enumType(values, metadata)`

- `values` {*[]}
- `metadata` {Object}
- Returns: {EnumTypeSpec} 

##### `indefiniteArrayOfType(itemType, metadata)`

- `itemType` {TypeSpec}
- `metadata` {Object}
- Returns: {IndefiniteArrayOfTypeSpec} 

##### `indefiniteObjectOfType(propertyType, metadata)`

- `propertyType` {TypeSpec}
- `metadata` {Object}
- Returns: {IndefiniteObjectOfTypeSpec} 

##### `tupleType(items, metadata)`

- `items` {TypeSpec[]}
- `metadata` {Object}
- Returns: {TupleTypeSpec} 

##### `objectType(properties, metadata)`

- `properties` {Object}
- `metadata` {Object}
- Returns: {ObjectTypeSpec} 

##### `castTypeSpec(value, metadata)`

Attempts to cast a value into a TypeSpec object:
- if an `ObjectTypeSpec`, simply return the value itself
- if a `string`, converts it into a `SingleTypeSpec`
- if an `array`, converts it into an `OneOfTypesSpec`
- if a `plain object`, converts it into an `ObjectTypeSpec`
- otherwise returns `null` upon casting failure

- `value` {*}
- `metadata` {Object}
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



## Private methods

##### `_getType()`



##### `_isType()`



##### `_validateType()`
