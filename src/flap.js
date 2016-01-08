'use strict'

import jsonPath from 'jsonpath'

export class Guard {

  constructor(func: Function) {
    this.func = func || () => {}
  }

  value(...args) {
    return this.func(...args)
  }

  when({is, then}): Flap {
    if (is instanceof Function) {
      return new Guard((...args) =>
        (is(...args) ? then : this.func)(...args)
      )
    } else {
      return new Guard((...args) => {
        const matches = args.filter(arg => {
          const query   = arg instanceof Object ? jsonPath.query(arg, is) : []
          const isQuery = query && query.length

          return isQuery
        })
        
        return matches.length ? then(...matches, this.func) : this.func(...args)
      })
    }

    return this
  }

  unless({is, then}): Flap {
    return new Guard(then).when({ is, then: this.func })
  }

  before(then: Function): Flap {
    return new Guard((...args) => this.func(...then(...args)))
  }

  after(then: Function): Flap {
    return new Guard((...args) => then(this.func(...args)))
  }

  map(mapper: Function): Flap {
    return new Guard((...args) => this.func(...args.map(mapper)))
  }

  all({is, then}): Flap {
    return this.when({ is: (...args) => args.length === args.filter(is).length, then })
  }

  any({is, then}): Flap {
    return this.when({ is: (...args) => !!args.filter(is).length, then })
  }

  filter(is: Function): Flap {
    return new Guard((...args) => this.func(...args.filter(is)))
  }

  abort(is: Function): Flap {
    return this.when({ is, then: () => {} })
  }

}

export function guard(func: Function) {
  return new Guard(func)
}

export function bind() {
  Function.prototype.guard = (() => new Guard(this))()
}

export function unbind() {
  delete Function.prototype.guard
}

export const flap = { guard, bind }

export default flap
