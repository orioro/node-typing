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

- [`typing(types)`](#typingtypes)
- [`isType(expectedType, value)`](#istypeexpectedtype-value)
- [`validateType(expectedType, value)`](#validatetypeexpectedtype-value)
- [`getType(value)`](#gettypevalue)

##### `typing(types)`

- `types` {TypeAlternatives | TypeMap}
- Returns: {{ [isType](#istypeexpectedtype-value), [validateType](#validatetypeexpectedtype-value), [getType](#gettypevalue) }} 

##### `isType(expectedType, value)`

- `expectedType` {ExpectedType}
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
