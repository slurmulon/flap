'use strict'

import jsonPath from 'jsonpath'

export class Latch {

  constructor(func: Function) {
    this.func = func || () => {}
  }

  // TODO - support more advanced condition systems like FSM
  when({is, then}): Latch {
    if (is instanceof Function) {
      return new Latch((...args) => 
        (is(...args) ? then : this.func)(...args)
      )
    } else {
      return new Latch((...args) => {
        const matches = Array.from(args).filter(arg => {
          const query   = arg instanceof Object ? jsonPath.query(arg, is) : []
          const isQuery = !!query && query.length

          return isQuery
        })
        
        return matches.length ? then(...matches) : this.func(...args)
      })
    }

    return this
  }

  unless({is, then}): Latch {
    return new Latch(then).when({is, then: this.func})
  }

  before(then: Function): Latch {
    return new Latch((...args) => this.func(...then(...args)))
  }

  after(then: Function): Latch {
    return new Latch((...args) => then(this.func(...args)))
  }

  map(mapper: Function): Latch {
    return new Latch((...args) => this.func(...args.map(mapper)))
  }

  filter(is: Function): Latch {
    return new Latch((...args) => 
      this.func(...args.filter(arg => !!is(arg)))
    )
  }

  abort(is: Function): Latch {
    return this.when({is, then: () => {}})
  }

  value(...args) {
    return this.func(...args)
  }

  // assert - only calls function when all args meet some condition

  // one  - when arg is not an array
  // many - when arg is array

  // pass
  // fail

}

export function onto(func: Function) {
  return new Latch(func)
}

export function bind() {
  Object.prototype.latch = (func) => new Latch(func)
}

export const latch = {onto, bind}

export default latch
