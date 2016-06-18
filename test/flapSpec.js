import 'blanket'

import * as flap from '../src/flap'
import {$, path, pointer, query} from 'json-where'

import chai from 'chai'
import chaiThings from 'chai-things'

chai.should()
chai.use(chaiThings)

const isChainable = (obj) => {
  let expected = []

  Object.getOwnPropertyNames(flap.Guard.prototype).forEach((prop) => {
    if (prop !== 'constructor') {
      expected.push(prop)
    }
  })

  let actual = []

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (prop !== 'constructor') {
      actual.push(prop)
    }
  })

  return obj instanceof flap.Guard || actual.includes(...expected)
}

describe('flap', () => {
  describe('class Flap', () => {
    describe('constructor', () => {
      it('should be defined', () => {
        flap.Guard.constructor.should.be.a('function')
      })

      it('should return a Function', () => {
        const testFunc  = () => {}
        const testGuard = new flap.Guard(testFunc)

        testGuard.should.be.a('function')
      })

      it('should be chainable', () => {
        const testGuard = new flap.Guard()

        isChainable(testGuard).should.be.true
      })
    })

    describe('when', () => {
      it('should be defined', () => {
        flap.Guard.prototype.when.should.be.a('function')
      })

      it('provided a function, should avoid calling the original function `func` if `is` is truthy as guarded function is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : (a) => a === 0, 
          then : (a) => false
        })

        testGuard(0).should.be.false
        testGuard(1).should.be.true
      })

      it('provided a JSON relation (string), should avoid calling the original function `func` if `is` query is non-empty as guarded function is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : '/b',
          then : () => false
        })

        testGuard({a: 'z'}).should.be.true
        testGuard({b: 'y'}).should.be.false
      })

      it('provided a JSON relation (Pointer literal), should avoid calling the original function `func` if `is` query is non-empty as guarded function is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : pointer('/b'),
          then : () => false
        })

        testGuard({a: 'z'}).should.be.true
        testGuard({b: 'y'}).should.be.false
      })

      it('provided a JSON relation (Path literal), should avoid calling the original function `func` if `is` query is non-empty as guarded function is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : path('$..b'),
          then : () => false
        })

        testGuard({a: 'z'}).should.be.true
        testGuard({b: 'y'}).should.be.false
      })

      it('provided a JSON relation (Query literal), should avoid calling the original function `func` if `is` query is non-empty as guarded function is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : query('b'),
          then : () => false
        })

        testGuard({a: 'z'}).should.be.true
        testGuard({b: 'y'}).should.be.false
      })

      it('provided a JSON Where pattern (abstract literal), should avoid calling the original function `func` if `is` query is non-empty as guarded function is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : $('/b'),
          then : () => false
        })

        testGuard({a: 'z'}).should.be.true
        testGuard({b: 'y'}).should.be.false
      })

      describe('chainability', () => {
        let testGuard

        beforeEach(() => {
          testGuard = new flap.Guard((a,b) => a + b)
            .when({
              is   : (a,b) => a < 0,
              then : (a,b) => 'a'
            })
            .when({
              is   : (a,b) => b < 0,
              then : (a,b) => 'b'
            }) 
        })

        it('should be chainable', () => {
          const testGuard = new flap.Guard(() => true).when(() => {})

          isChainable(testGuard).should.be.true
        })

        it('should support N items in chain', () => {
          testGuard(1, 2).should.equal(3)
          testGuard(-1, 2).should.equal('a')
          testGuard(1,-1).should.equal('b')
        })

        it('should return the last value when multiple `when`s are triggered in a chain', () => {
          testGuard(-1, -1).should.equal('b')
        })
      })
    })

    describe('()', () => {
      it('should call every `Guard` in the chain', () => {
        const testGuard = new flap.Guard((a,b,c) => a + b + c)
          .before((a,b,c) => [(a < 0 ? 1 : a), b, c])
          .when({
            is   : (a,b,c) => a === b,
            then : (a,b,c) => b
          })
          .when({
            is   : (a,b,c) => a > b,
            then : (a,b,c) => c
          })
          .when({
            is   : (a,b,c) => typeof a === 'string',
            then : (a,b,c) => a + '!'
          })

        testGuard(-1, 2, 4).should.equal(7) // only "before"
        testGuard(1, 1, 5).should.equal(1)  // "before", "a === b"
        testGuard(4, 1, 3).should.equal(3)  // "before", "a > b"
        testGuard('foo').should.equal('foo!')
      })
    })

    describe('before', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b,c) => a + b + c).before((a,b,c) => [(a < 0 ? 1 : a), b, c])
      })

      it('should be defined', () => {
        flap.Guard.prototype.before.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should process arguments provided to `value` before any `Guard`s process them', () => {
        testGuard(-1, 1, 1).should.equal(3)
      })
    })

    describe('after', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b,c) => a + b + c)
          .when({
            is   : (a,b,c) => a === 1,
            then : (a,b,c) => 5
          })
          .after((res) => res *= 2)
      })

      it('should be defined', () => {
        flap.Guard.prototype.after.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should process arguments provided to `value` after all other `Guard`s run', () => {
        testGuard(1,2,3).should.equal(10)
      })
    })

    describe('map', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b,c) => a + b + c).map((arg) => arg *= 3)
      })

      it('should be defined', () => {
        flap.Guard.prototype.map.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should map arguments provided to `value` before any `Guard`s process them', () => {
        testGuard(1,2,3).should.equal(18)
      })
    })

    describe('filter', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b) => a || b).filter((arg) => arg === true || arg === false)
      })

      it('should be defined', () => {
        flap.Guard.prototype.filter.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard(false,'a',false).should.equal(false)
      })
    })

    describe('unless', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b,c) => a + b + c).unless({
          is   : (a,b,c) => a % 2 === 0, 
          then : (a,b,c) => 1
        })
      })

      it('should be defined', () => {
        flap.Guard.prototype.unless.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard(3,2,1).should.equal(1)
        testGuard(4,3,2).should.equal(9)
      })
    })

    describe('all', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b,c) => a + b + c).all({
          is   : (a,b,c) => a % 2 === 0,
          then : (a,b,c) => 2
        })
      })

      it('should be defined', () => {
        flap.Guard.prototype.all.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard(2,4,6).should.equal(2)
        testGuard(1,4,6).should.equal(11)
      })
    })

    describe('any', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b,c) => a + b + c).any({
          is   : (a,b,c) => a % 2 === 0,
          then : (a,b,c) => 0
        })
      })

      it('should be defined', () => {
        flap.Guard.prototype.any.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard(1,3,5).should.equal(9)
        testGuard(1,3,6).should.equal(0)
        testGuard(1,4,6).should.equal(0)
      })
    })

    describe('abort', () => {
      let testGuard

      beforeEach(() => {
        testGuard = new flap.Guard((a,b,c) => a + b + c).abort((a) => a % 2 === 0)
      })

      it('should be defined', () => {
        flap.Guard.prototype.abort.should.be.a('function')
      })

      it('should be chainable', () => {
        isChainable(testGuard).should.be.true
      })

      it('should avoid calling the function altogether if the condition is met', () => {
        testGuard(1,3,5).should.equal(9);
        chai.should(testGuard(2,3,5)).not.exist
      })
    })
  })

  describe('module exports', () => {
    describe('guard', () => {
      it('should be exported', () => {
        flap.guard.should.be.a('function')
      })

      it('should create and return a new instance of `Guard`', () => {
        const testFunc  = (a, b) => a + b
        const testGuard = flap.guard(testFunc)

        testGuard.should.be.a('function')
        testGuard(1,2).should.equal(3)
      })

      it('should be chainable', () => {
        const testGuard = flap.guard()

        isChainable(testGuard).should.be.true
      })
    })

    describe('bind', () => {
      before(flap.bind)
      after(flap.unbind)

      it('should be exported', () => {
        flap.bind.should.be.a('function')
      })

      it('should bind a `guard` function to `Function.prototype` that is an alias of `new Guard`', () => {
        const testFunc = (a,b) => a + b

        ((a) => a).guard.should.be.a('function') // anon function
        testFunc.guard.should.be.a('function')
        // testFunc.guard.should.be.an.instanceof(flap.Guard)
        testFunc.guard.when({
          is   : (a,b) => a % 2 === 0,
          then : (a,b) => true
        })(2, 3).should.equal(true)
      })
    })

    describe('unbind', () => {
      before(flap.bind)
      after(flap.unbind)

      it('should be exported', () => {
        flap.unbind.should.be.a('function')
      })

      it('should unbind any `guard` function on `Object.prototype`', () => {
        flap.unbind()

        const testFunc = (a,b) => a + b

        chai.should(testFunc.guard).not.exist
      })
    })
  })
})
