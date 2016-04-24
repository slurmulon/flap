'use strict'

import * as rel from 'json-rel'

/**
 * Implements several chainable guard clauses, similar to those
 * found in languages such as Elixir and Ruby.
 *
 * Useful for extending the logic of functions in a non-invasive
 * manner and improving readability and/or learnability by reducing
 * deeply nested constructs / callback hell.
 */
export class Guard {

  /**
   * Wraps a function with a chainable guard clause object.
   *
   * @param {Function} func function to guard with clauses
   */
  constructor(func: Function = _ => {}) {
    this.func = func
  }

  /**
   * Delegates arguments through guard clause chain and provides final value.
   *
   * @param {...Object} arguments to pass through function chain
   * @returns {Object}
   */
  value(...args): Object {
    return this.func(...args)
  }

  /**
   * If `is` is truthy for the set of arguments, `then` will be called
   * with the arguments. Otherwise the original function in the Guard
   * will be called.
   *
   * @param {Function|String} is Function or JsonPath pattern to use as truthy condition
   * @param {Function} then callback Function for when `is` condition matches arguments
   * @returns {Guard} new Guard (identical to original if condition isn't met)
   * @example
   *
   * import flap from 'flap'
   *
   * const isEven = flap.guard(() => false)
   *   .map(parseInt) // ensure all arguments are numbers
   *   .when({
   *     is   : (x) = x % 2 === 0,
   *     then : (x) => true
   *   })
   *
   * isEven(1)   // -> false
   * isEven('6') // -> true
   */
  when({is, then}): Guard {
    if (is instanceof Function) {
      return new Guard((...args) =>
        (is(...args) ? then : this.func)(...args)
      )
    } else {
      return new Guard((...args) => {
        let matches = []

        if (is && is.constructor === String) {
          matches = args.filter(arg => !!rel.$(is, arg).get())
        } else if (is instanceof rel.AbstractRel) {
          matches = args.filter(arg => is.any(arg))
        }

        return matches.length ? then(...matches) : this.func(...args)
      })
    }

    return this
  }

  /**
   * Unless `is` is true, call `then` instead of the original guarded function
   *
   * In other words, it essentially inverts original guarded function logic
   * by switching the original function with the newly provided `then` function
   * whenever `is` is truthy.
   *
   * @param {Function|String} is Function or JsonPath pattern to use as truthy condition
   * @param {Function} then callback Function for when `is` condition matches arguments
   * @returns {Guard} new Guard (identical to original if condition isn't met)
   */
  unless({is, then}): Guard {
    return new Guard(then).when({ is, then: this.func })
  }

  /**
   * When every argument is truthy for `is`, call `then`. Otherwise call
   * the original guarded function.
   *
   * @param {Function|String} is Function or JsonPath pattern to use as truthy condition
   * @param {Function} then callback Function for when `is` condition matches arguments
   * @returns {Guard} new Guard (identical to original if condition isn't met)
   */
  all({is, then}): Guard {
    return this.when({ is: (...args) => args.length === args.filter(is).length, then })
  }

  /**
   * When any argument is truthy for `is`, call `then`. Otherwise call
   * the original guarded function.
   *
   * @param {Function|String} is Function or JsonPath pattern to use as truthy condition
   * @param {Function} then callback Function for when `is` condition matches arguments
   * @returns {Guard} new Guard (identical to original if condition isn't met)
   */
  any({is, then}): Guard {
    return this.when({ is: (...args) => args.filter(is).length, then })
  }

  /**
   * Processes arguments with `then` before any other functions in the guarded chain
   * are called.
   *
   * @param {Function} then callback Function for when `is` condition matches arguments
   * @returns {Guard} new Guard with `then` at the top of the chain
   */
  before(then: Function): Guard {
    return new Guard((...args) => this.func(...then(...args)))
  }

  /**
   * Processes final guarded chain result with `then`.
   *
   * @param {Function} then callback Function for when `is` condition matches arguments
   * @returns {Guard} new Guard with `then` at the bottom of the chain
   */
  after(then: Function): Guard {
    return new Guard((...args) => then(this.func(...args)))
  }

  /**
   * Maps each argument with `mapper`.
   *
   * @param {Function} mapper callback Function to call on each argument
   * @returns {Guard} new Guard with mapped arguments provided to original function
   */
  map(mapper: Function): Guard {
    return new Guard((...args) => this.func(...args.map(mapper)))
  }

  /**
   * Filters arguments that match `is` (only those matchin truthy will be passed in).
   *
   * @param {Function} is filter Function (truthy)
   * @returns {Guard} new Guard with filtered arguments provided to original function
   */
  filter(is: Function): Guard {
    return new Guard((...args) => this.func(...args.filter(is)))
  }

  /**
   * Aborts guarded function chain completely if `is` condition is truthy.
   *
   * @param {Function} is condition to abort on
   * @returns {Guard} new Guard with appended abort `when` clause
   */
  abort(is: Function): Guard {
    return this.when({ is, then: () => {} })
  }

}

/**
 * Convenience alias for flap.Guard constructor
 *
 * @param {Function} func function to wrap with chainable guard clauses
 * @returns {Guard} new chainable Guard
 */
export function guard(func: Function) {
  return new Guard(func)
}

/**
 * Sets a `guard` function onto the global `Function.prototype` object.
 * Allows `guard` object to be referenced on anonymous functions directly.
 *
 * Note that `value()` must be called instead of the traditional '()'.
 *
 * @example
 *
 * import flap from 'flap'
 *
 * flap.bind()
 *
 * const divide = ((a,b) => a / b).guard.when({
 *   is   : (a,b) => b === 0,
 *   then : (a,b) => a / 1
 * })
 *
 * divide.value(6, 2) // -> 3
 * divide.value(6, 0) // -> 6 (0 is replaced by 1 via `when`)
 */
export function bind() {
  Function.prototype.guard = (() => new Guard(this))()
}

/**
 * Removes `guard` function from the global `Function.prototype` object.
 */
export function unbind() {
  delete Function.prototype.guard
}

/**
 * Module object definition.
 */
export const flap = { guard, bind }

/**
 * Module export.
 */
export default flap
