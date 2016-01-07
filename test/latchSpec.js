import 'blanket'

import * as latch from '../src/latch'
import _ from 'lodash'

import chai from 'chai'
import chaiThings from 'chai-things'

chai.should()
chai.use(chaiThings)

describe('latch', () => {
  describe('class Latch', () => {
    describe('constructor', () => {
      it('should be defined', () => {
        latch.Latch.constructor.should.be.a('function')
      })

      it('should accept a Function', () => {
        const testFunc  = () => {}
        const testLatch = new latch.Latch(testFunc)

        testLatch.func.should.equal(testFunc)
      })
    })

    describe('when', () => {
      it('should be defined', () => {
        latch.Latch.prototype.when.should.be.a('function')
      })

      it('provided a function, should avoid calling the original function `func` if `is` is truthy as `value` is called', () => {
        const testLatch = new latch.Latch(() => true).when({
          is   : (a) => a === 0, 
          then : (a) => false
        })

        testLatch.value(0).should.be.false
        testLatch.value(1).should.be.true
      })

      it('provided a JsonPath query, should avoid calling the original function `func` if `is` query is non-empty as `value` is called', () => {
        const testLatch = new latch.Latch(() => true).when({
          is   : '$..b', 
          then : () => false
        })

        testLatch.value({a: 'z'}).should.be.true
        testLatch.value({b: 'y'}).should.be.false
      })

      describe('chainability', () => {
        let testLatch

        beforeEach(() => {
          testLatch = new latch.Latch((a,b) => a + b).
            when({
              is   : (a,b) => a < 0,
              then : (a,b) => 'a'
            }).
            when({
              is   : (a,b) => b < 0,
              then : (a,b) => 'b'
            }) 
        })

        it('should be chainable', () => {
          const testLatch = new latch.Latch(() => true).when(() => {})

          testLatch.should.be.an.instanceof(latch.Latch)
        })

        it('should support N items in chain', () => {
          testLatch.value(1, 2).should.equal(3)
          testLatch.value(-1, 2).should.equal('a')
          testLatch.value(1,-1).should.equal('b')
        })

        it('should return the last value when multiple `when`s are triggered in a chain', () => {
          testLatch.value(-1, -1).should.equal('b')
        })
      })
    })

    describe('value', () => {
      it('should be defined', () => {
        latch.Latch.prototype.value.should.be.a('function')
      })

      it('should call every `Latch` in the chain', () => {
        const testLatch = new latch.Latch((a,b,c) => a + b + c).
          before((a,b,c) => [(a < 0 ? 1 : a), b, c]).
          when({
            is   : (a,b,c) => a === b,
            then : (a,b,c) => b
          }).
          when({
            is   : (a,b,c) => a > b,
            then : (a,b,c) => c
          }).
          when({
            is   : (a,b,c) => typeof a === 'string',
            then : (a,b,c) => a + '!'
          })

        testLatch.value(-1, 2, 4).should.equal(7) // only "before"
        testLatch.value(1, 1, 5).should.equal(1)  // "before", "a === b"
        testLatch.value(4, 1, 3).should.equal(3)  // "before", "a > b"
        testLatch.value('foo').should.equal('foo!')
      })
    })

    describe('before', () => {
      let testLatch

      beforeEach(() => {
        testLatch = new latch.Latch((a,b,c) => a + b + c).before((a,b,c) => [(a < 0 ? 1 : a), b, c])
      })

      it('should be defined', () => {
        latch.Latch.prototype.before.should.be.a('function')
      })

      it('should be chainable', () => {
        testLatch.should.be.an.instanceof(latch.Latch)
      })

      it('should process arguments provided to `value` before any `Latch`s process them', () => {
        testLatch.value(-1, 1, 1).should.equal(3)
      })
    })

    describe('after', () => {
      let testLatch

      beforeEach(() => {
        testLatch = new latch.Latch((a,b,c) => a + b + c)
          .when({
            is   : (a,b,c) => a === 1,
            then : (a,b,c) => 5
          })
          .after((res) => res *= 2)
      })

      it('should be defined', () => {
        latch.Latch.prototype.after.should.be.a('function')
      })

      it('should be chainable', () => {
        testLatch.should.be.an.instanceof(latch.Latch)
      })

      it('should process arguments provided to `value` after all other `Latch`s run', () => {
        testLatch.value(1,2,3).should.equal(10)
      })
    })

    describe('map', () => {
      let testLatch

      beforeEach(() => {
        testLatch = new latch.Latch((a,b,c) => a + b + c).map((arg) => arg *= 3)
      })

      it('should be defined', () => {
        latch.Latch.prototype.map.should.be.a('function')
      })

      it('should be chainable', () => {
        testLatch.should.be.an.instanceof(latch.Latch)
      })

      it('should map arguments provided to `value` before any `Latch`s process them', () => {
        testLatch.value(1,2,3).should.equal(18)
      })
    })

    describe('map', () => {
      let testLatch

      beforeEach(() => {
        testLatch = new latch.Latch((a,b,c) => a + b + c).map((arg) => arg *= 3)
      })

      it('should be defined', () => {
        latch.Latch.prototype.map.should.be.a('function')
      })

      it('should be chainable', () => {
        testLatch.should.be.an.instanceof(latch.Latch)
      })

      it('should intercept arguments provided to `value` before any `Latch`s process them', () => {
        testLatch.value(1,2,3).should.equal(18)
      })
    })

    describe('unless', () => {
      let testLatch

      beforeEach(() => {
        testLatch = new latch.Latch((a,b,c) => a + b + c).unless({
          is   : (a,b,c) => a % 2 === 0, 
          then : (a,b,c) => 1
        })
      })

      it('should be defined', () => {
        latch.Latch.prototype.unless.should.be.a('function')
      })

      it('should be chainable', () => {
        testLatch.should.be.an.instanceof(latch.Latch)
      })

      it('should intercept arguments provided to `value` before any `Latch`s process them', () => {
        testLatch.value(3,2,1).should.equal(1)
        testLatch.value(4,3,2).should.equal(9)
      })
    })

    describe('abort', () => {
      let testLatch

      beforeEach(() => {
        testLatch = new latch.Latch((a,b,c) => a + b + c).abort((a) => a % 2 === 0)
      })

      it('should be defined', () => {
        latch.Latch.prototype.abort.should.be.a('function')
      })

      it('should be chainable', () => {
        testLatch.should.be.an.instanceof(latch.Latch)
      })

      it('should avoid calling the function altogether if the condition is met', () => {
        testLatch.value(1,3,5).should.equal(9);
        chai.should(testLatch.value(2,3,5)).not.exist
      })
    })
  })

  describe('onto', () => {
    it('should be exported', () => {
      latch.onto.should.be.a('function')
    })

    // TODO
  })

  describe('bind', () => {
    it('should be exported', () => {
      latch.bind.should.be.a('function')  
    })

    // TODO
  })
})
