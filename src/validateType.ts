import { TypeMap, TypeSpec, TypeAlternatives } from './types'
import { _isType } from './isType'
import { _getType } from './getType'

import { stringifyTypeSpec } from './typeSpec'

/**
 * @function _validateType
 * @private
 */
export const _validateType = (
  typeMap: TypeMap,
  typeAlternatives: TypeAlternatives,
  expectedType: TypeSpec,
  value: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): void => {
  if (!_isType(typeMap, expectedType, value)) {
    throw new TypeError(
      `Expected \`${stringifyTypeSpec(expectedType)}\` but got \`${_getType(
        typeAlternatives,
        value
      )}\`: ${JSON.stringify(value)}`
    )
  }
}
