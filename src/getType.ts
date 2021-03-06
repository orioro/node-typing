import { cascadeFind, test } from '@orioro/cascade'
import { TypeAlternatives } from './types'

/**
 * @todo typing Move _getType function into isolate file
 * @function _getType
 * @private
 */
export const _getType = (
  typeAlternatives: TypeAlternatives,
  value: any // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
): string => {
  const type = cascadeFind(test, typeAlternatives, value)

  if (type === undefined) {
    throw new Error(`Could not identify value type: ${value}`)
  }

  return type
}
