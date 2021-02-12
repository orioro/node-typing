# validateType

```
npm install @orioro/validate-type
yarn add @orioro/validate-type
```

Simple type validation utilities. Meant for checking types of argument input
in microlibraries. For more complex use cases, such as object property or array
item validation, see either:
- `@orioro/expression` - https://github.com/orioro/node-expression
- `@orioro/validate` - https://github.com/orioro/node-validate
- `@orioro/schema` - https://github.com/orioro/schema

# API Docs

- [`getType(value)`](#gettypevalue)
- [`typeValidator(getType)`](#typevalidatorgettype)
- [`isType(expectedTypes, value)`](#istypeexpectedtypes-value)
- [`validateType(expectedTypes, value)`](#validatetypeexpectedtypes-value)

##### `getType(value)`

- `value` {*}
- Returns: `type` {string} Possible values:
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

##### `typeValidator(getType)`

- `getType` {Function}
- Returns: {{ [isType](#istypeexpectedtypes-value), [validateType](#validatetypeexpectedtypes-value) }} 

##### `isType(expectedTypes, value)`

- `expectedTypes` {string[] | string}
- `value` {*}
- Returns: {boolean} 

##### `validateType(expectedTypes, value)`

If typing is invalid, throws TypeError.
Returns nothing (undefined) otherwise.

- `expectedTypes` {string[] | string}
- `value` {*}
- Returns: {undefined}
