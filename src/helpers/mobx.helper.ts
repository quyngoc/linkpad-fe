import { reaction } from 'mobx'
import { isEqual } from 'lodash'

export const reactionWithPrev = <T>(expression: () => T, effect: (newValue: T, oldValue?: T) => void) => {
  let oldValue: T
  return reaction(expression, v => {
    if (!isEqual(v, oldValue)) {
      effect(v, oldValue)
      oldValue = v
    }
  })
}
