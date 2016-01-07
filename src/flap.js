'use strict'

import jsonPath from 'jsonpath'

export class Flap {

  constructor(func: Function) {
    this.func = func || () => {}
  }

  // TODO - support more advanced condition systems like FSM
  when({is, then}): Flap {
    if (is instanceof Function) {
      return new Flap((...args) => 
        (is(...args) ? then : this.func)(...args)
      )
    } else {
      return new Flap((...args) => {
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

  unless({is, then}): Flap {
    return new Flap(then).when({is, then: this.func})
  }

  before(then: Function): Flap {
    return new Flap((...args) => this.func(...then(...args)))
  }

  after(then: Function): Flap {
    return new Flap((...args) => then(this.func(...args)))
  }

  map(mapper: Function): Flap {
    return new Flap((...args) => this.func(...args.map(mapper)))
  }

  filter(is: Function): Flap {
    return new Flap((...args) => 
      this.func(...args.filter(arg => !!is(arg)))
    )
  }

  abort(is: Function): Flap {
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
  return new Flap(func)
}

export function bind() {
  Object.prototype.flap = (func) => new Flap(func)
}

export const flap = {onto, bind}

export default flap
