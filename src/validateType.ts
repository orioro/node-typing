type ExpectedTypes = (string[] | string)

/**
 * @function getType
 * @param {*} value
 * @returns {string} type Possible values:
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
export const getType = (value:any):string => {
  const type = typeof value

  switch (type) {
    case 'object':
      return Array.isArray(value)
        ? 'array' // result is the same but for style, prefer explicitly checking for array
        : Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
    case 'number':
      return isNaN(value)
        ? 'nan'
        : 'number'
    default:
      return type
  }
}

/**
 * @function typeValidator
 * @param {Function} getType Callback function that receives a value and
 *                           is expected to return its type.
 * @returns {{ isType, validateType }}
 */
export const typeValidator = (
  getType:(value:any) => string
) => {
  const isType = (expectedTypes:ExpectedTypes, value:any):boolean => {
    const type = getType(value)

    return Array.isArray(expectedTypes)
      ? expectedTypes.includes(type)
      : expectedTypes === type
  }

  const validateType = (expectedTypes:ExpectedTypes, value:any):void => {
    if (!isType(expectedTypes, value)) {
      throw new TypeError(`Expected \`${Array.isArray(expectedTypes) ? expectedTypes.join(' | ') : expectedTypes}\` but got \`${getType(value)}\`: ${JSON.stringify(value)}`);
    }
  }

  return {
    isType,
    validateType
  }
}

/**
 * @function isType
 * @param {string[] | string} expectedTypes Type or array of types that are allowed for the
 *                                          given value. Use `null` and `undefined` to allow
 *                                          these values
 * @param {*} value The value whose type is being tested
 * @returns {boolean}
 */

/**
 * If typing is invalid, throws TypeError.
 * Returns nothing (undefined) otherwise.
 * 
 * @function validateType
 * @param {string[] | string} expectedTypes Type or array of types that are allowed for the
 *                                          given value. Use `null` and `undefined` to allow
 *                                          these values
 * @param {*} value The value whose type is being tested
 * @returns {undefined}
 * @throws {TypeError}
 */
const {
  isType,
  validateType
} = typeValidator(getType)

export {
  isType,
  validateType
}
