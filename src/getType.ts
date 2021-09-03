import { cascadeFind, test } from '@orioro/cascade'
import { TypeAlternatives } from './types'

/**
 * @function _getType
 * @private
 */
export const _getType = (
  typeAlternatives: TypeAlternatives,
  value: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): string | undefined => cascadeFind(test, typeAlternatives, value)
