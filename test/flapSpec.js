import 'blanket'

import * as flap from '../src/flap'

import chai from 'chai'
import chaiThings from 'chai-things'

chai.should()
chai.use(chaiThings)

describe('flap', () => {
  describe('class Flap', () => {
    describe('constructor', () => {
      it('should be defined', () => {
        flap.Guard.constructor.should.be.a('function')
      })

      it('should accept a Function', () => {
        const testFunc  = () => {}
        const testGuard = new flap.Guard(testFunc)

        testGuard.func.should.equal(testFunc)
      })

      it('should use an empty anonymous function when no func is provided', () => {
        const testGuard = new flap.Guard()

        chai.should(testGuard.func()).not.exist
      })
    })

    describe('when', () => {
      it('should be defined', () => {
        flap.Guard.prototype.when.should.be.a('function')
      })

      it('provided a function, should avoid calling the original function `func` if `is` is truthy as `value` is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : (a) => a === 0, 
          then : (a) => false
        })

        testGuard.value(0).should.be.false
        testGuard.value(1).should.be.true
      })

      it('provided a JsonPath query, should avoid calling the original function `func` if `is` query is non-empty as `value` is called', () => {
        const testGuard = new flap.Guard(() => true).when({
          is   : '$..b', 
          then : () => false
        })

        testGuard.value({a: 'z'}).should.be.true
        testGuard.value({b: 'y'}).should.be.false
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

          testGuard.should.be.an.instanceof(flap.Guard)
        })

        it('should support N items in chain', () => {
          testGuard.value(1, 2).should.equal(3)
          testGuard.value(-1, 2).should.equal('a')
          testGuard.value(1,-1).should.equal('b')
        })

        it('should return the last value when multiple `when`s are triggered in a chain', () => {
          testGuard.value(-1, -1).should.equal('b')
        })
      })
    })

    describe('value', () => {
      it('should be defined', () => {
        flap.Guard.prototype.value.should.be.a('function')
      })

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

        testGuard.value(-1, 2, 4).should.equal(7) // only "before"
        testGuard.value(1, 1, 5).should.equal(1)  // "before", "a === b"
        testGuard.value(4, 1, 3).should.equal(3)  // "before", "a > b"
        testGuard.value('foo').should.equal('foo!')
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should process arguments provided to `value` before any `Guard`s process them', () => {
        testGuard.value(-1, 1, 1).should.equal(3)
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should process arguments provided to `value` after all other `Guard`s run', () => {
        testGuard.value(1,2,3).should.equal(10)
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should map arguments provided to `value` before any `Guard`s process them', () => {
        testGuard.value(1,2,3).should.equal(18)
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard.value(false,'a',false).should.equal(false)
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard.value(3,2,1).should.equal(1)
        testGuard.value(4,3,2).should.equal(9)
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard.value(2,4,6).should.equal(2)
        testGuard.value(1,4,6).should.equal(11)
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should intercept arguments provided to `value` before any `Guard`s process them', () => {
        testGuard.value(1,3,5).should.equal(9)
        testGuard.value(1,3,6).should.equal(0)
        testGuard.value(1,4,6).should.equal(0)
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
        testGuard.should.be.an.instanceof(flap.Guard)
      })

      it('should avoid calling the function altogether if the condition is met', () => {
        testGuard.value(1,3,5).should.equal(9);
        chai.should(testGuard.value(2,3,5)).not.exist
      })
    })
  })

  describe('guard', () => {
    it('should be exported', () => {
      flap.guard.should.be.a('function')
    })

    it('should create and return a new instance of `Guard`', () => {
      const testFunc  = (a, b) => a + b
      const testGuard = flap.guard(testFunc)

      testGuard.should.be.an.instanceof(flap.Guard)
      testGuard.func.should.equal(testFunc)
    })
  })

  describe('bind', () => {
    before(flap.bind)
    after(flap.unbind)

    it('should be exported', () => {
      flap.bind.should.be.a('function')  
    })

    it('should bind a `guard` function to `Object.prototype` that is an alias of `new Guard`', () => {
      const testFunc = (a,b) => a + b

      ((a) => a).guard.should.be.a('object') // anon function
      testFunc.guard.should.be.a('object')
      testFunc.guard.should.be.an.instanceof(flap.Guard)
      testFunc.guard.when({
        is   : (a,b) => a % 2 === 0,
        then : (a,b) => true
      }).value(2, 3).should.equal(true)
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
