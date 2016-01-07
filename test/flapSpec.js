import 'blanket'

import * as flap from '../src/flap'
import _ from 'lodash'

import chai from 'chai'
import chaiThings from 'chai-things'

chai.should()
chai.use(chaiThings)

describe('flap', () => {
  describe('class Flap', () => {
    describe('constructor', () => {
      it('should be defined', () => {
        flap.Flap.constructor.should.be.a('function')
      })

      it('should accept a Function', () => {
        const testFunc  = () => {}
        const testFlap = new flap.Flap(testFunc)

        testFlap.func.should.equal(testFunc)
      })
    })

    describe('when', () => {
      it('should be defined', () => {
        flap.Flap.prototype.when.should.be.a('function')
      })

      it('provided a function, should avoid calling the original function `func` if `is` is truthy as `value` is called', () => {
        const testFlap = new flap.Flap(() => true).when({
          is   : (a) => a === 0, 
          then : (a) => false
        })

        testFlap.value(0).should.be.false
        testFlap.value(1).should.be.true
      })

      it('provided a JsonPath query, should avoid calling the original function `func` if `is` query is non-empty as `value` is called', () => {
        const testFlap = new flap.Flap(() => true).when({
          is   : '$..b', 
          then : () => false
        })

        testFlap.value({a: 'z'}).should.be.true
        testFlap.value({b: 'y'}).should.be.false
      })

      describe('chainability', () => {
        let testFlap

        beforeEach(() => {
          testFlap = new flap.Flap((a,b) => a + b).
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
          const testFlap = new flap.Flap(() => true).when(() => {})

          testFlap.should.be.an.instanceof(flap.Flap)
        })

        it('should support N items in chain', () => {
          testFlap.value(1, 2).should.equal(3)
          testFlap.value(-1, 2).should.equal('a')
          testFlap.value(1,-1).should.equal('b')
        })

        it('should return the last value when multiple `when`s are triggered in a chain', () => {
          testFlap.value(-1, -1).should.equal('b')
        })
      })
    })

    describe('value', () => {
      it('should be defined', () => {
        flap.Flap.prototype.value.should.be.a('function')
      })

      it('should call every `Flap` in the chain', () => {
        const testFlap = new flap.Flap((a,b,c) => a + b + c).
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

        testFlap.value(-1, 2, 4).should.equal(7) // only "before"
        testFlap.value(1, 1, 5).should.equal(1)  // "before", "a === b"
        testFlap.value(4, 1, 3).should.equal(3)  // "before", "a > b"
        testFlap.value('foo').should.equal('foo!')
      })
    })

    describe('before', () => {
      let testFlap

      beforeEach(() => {
        testFlap = new flap.Flap((a,b,c) => a + b + c).before((a,b,c) => [(a < 0 ? 1 : a), b, c])
      })

      it('should be defined', () => {
        flap.Flap.prototype.before.should.be.a('function')
      })

      it('should be chainable', () => {
        testFlap.should.be.an.instanceof(flap.Flap)
      })

      it('should process arguments provided to `value` before any `Flap`s process them', () => {
        testFlap.value(-1, 1, 1).should.equal(3)
      })
    })

    describe('after', () => {
      let testFlap

      beforeEach(() => {
        testFlap = new flap.Flap((a,b,c) => a + b + c)
          .when({
            is   : (a,b,c) => a === 1,
            then : (a,b,c) => 5
          })
          .after((res) => res *= 2)
      })

      it('should be defined', () => {
        flap.Flap.prototype.after.should.be.a('function')
      })

      it('should be chainable', () => {
        testFlap.should.be.an.instanceof(flap.Flap)
      })

      it('should process arguments provided to `value` after all other `Flap`s run', () => {
        testFlap.value(1,2,3).should.equal(10)
      })
    })

    describe('map', () => {
      let testFlap

      beforeEach(() => {
        testFlap = new flap.Flap((a,b,c) => a + b + c).map((arg) => arg *= 3)
      })

      it('should be defined', () => {
        flap.Flap.prototype.map.should.be.a('function')
      })

      it('should be chainable', () => {
        testFlap.should.be.an.instanceof(flap.Flap)
      })

      it('should map arguments provided to `value` before any `Flap`s process them', () => {
        testFlap.value(1,2,3).should.equal(18)
      })
    })

    describe('map', () => {
      let testFlap

      beforeEach(() => {
        testFlap = new flap.Flap((a,b,c) => a + b + c).map((arg) => arg *= 3)
      })

      it('should be defined', () => {
        flap.Flap.prototype.map.should.be.a('function')
      })

      it('should be chainable', () => {
        testFlap.should.be.an.instanceof(flap.Flap)
      })

      it('should intercept arguments provided to `value` before any `Flap`s process them', () => {
        testFlap.value(1,2,3).should.equal(18)
      })
    })

    describe('unless', () => {
      let testFlap

      beforeEach(() => {
        testFlap = new flap.Flap((a,b,c) => a + b + c).unless({
          is   : (a,b,c) => a % 2 === 0, 
          then : (a,b,c) => 1
        })
      })

      it('should be defined', () => {
        flap.Flap.prototype.unless.should.be.a('function')
      })

      it('should be chainable', () => {
        testFlap.should.be.an.instanceof(flap.Flap)
      })

      it('should intercept arguments provided to `value` before any `Flap`s process them', () => {
        testFlap.value(3,2,1).should.equal(1)
        testFlap.value(4,3,2).should.equal(9)
      })
    })

    describe('abort', () => {
      let testFlap

      beforeEach(() => {
        testFlap = new flap.Flap((a,b,c) => a + b + c).abort((a) => a % 2 === 0)
      })

      it('should be defined', () => {
        flap.Flap.prototype.abort.should.be.a('function')
      })

      it('should be chainable', () => {
        testFlap.should.be.an.instanceof(flap.Flap)
      })

      it('should avoid calling the function altogether if the condition is met', () => {
        testFlap.value(1,3,5).should.equal(9);
        chai.should(testFlap.value(2,3,5)).not.exist
      })
    })
  })

  describe('onto', () => {
    it('should be exported', () => {
      flap.onto.should.be.a('function')
    })

    // TODO
  })

  describe('bind', () => {
    it('should be exported', () => {
      flap.bind.should.be.a('function')  
    })

    // TODO
  })
})
