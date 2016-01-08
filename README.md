# flap

> Guard clauses for ES6

-----

## Features

 * Wraps JS functions and their arguments with [guard clauses](https://sourcemaking.com/refactoring/replace-nested-conditional-with-guard-clauses) found in languages such as Ruby and Elixir:
    * __`when`__
    * __`unless`__
    * `map`
    * `filter`
    * `all`
    * `any`
    * `before`
    * `after`
    * `abort`
 * Improves readibility of complex conditions
 * Helps prevent deep nesting and callback hell

## Examples

  * `when`

    ```javascript
    const positiveSlope = flap
      .guard((m,x,b) => (m * x) + b)
      .map(parseInt)
      .when({
        is   : (m,x,b) => (m * x) < 0,
        then : (m,x,b) => 0
      })
      .after({
        then : (y) => Math.max(y, 90)
      })

    positiveSlope.value(-1, -1, 3)     // 0
    positiveSlope.value('1', '2.0', 3) // 6
    positiveSlope.value(100, 200, 300) // 100
    ```

  * `unless`

    ```javascript
    const add = flap
      .guard((a,b,c) => a + b + c)
      .unless({
        is   : (a,b,c) => a % 2 === 0,
        then : (a,b,c) => -1
      })

    add.value(2, 4, 6) // 12
    add.value(1, 3, 5) // -1
    ````

## Installation

  ```
  $ npm install flap
  ```

## Usage

  ```javascript
  import flap from 'flap'
  ```

  after `flap` is inmported, you may optionally bind `guard` to all functions
  via `flap.bind` for a DSL-like syntax:

  ```javascript
  flap.bind()

  const divide = ((a,b) => a / b).guard.when({is: (a,b) => b === 0, then: (a,b) => 'derp'})

  divide.value(10, 2) // -> 5
  divide.value(1, 0)  // -> 'derp'
  ```

## Contributing

  Contributions are always welcome! Simply open a PR with completely covered tests.

## TODO

 - [ ] `inject` - implicit dependency injection
 - [ ] documentation (code, guide)
