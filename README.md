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
 * Improves readability of complex conditions
 * Helps prevent deep nesting and callback hell

## Examples

  * `when`

    This example also uses `map` to ensure all arguments are `Number`s and
    `after` to ensure that the final value doesn't exceeed 90.

    ```javascript
    const positiveSlope = flap
      .guard((m,x,b) => (m * x) + b)
      .map(parseInt)
      .when({
        is   : (m,x,b) => (m * x) < 0,
        then : (m,x,b) => 0
      })
      .after((y) => Math.max(y, 90))

    positiveSlope.value(-1, -1, 3)     // 0
    positiveSlope.value('1', '2.0', 3) // 6
    positiveSlope.value(100, 200, 300) // 90
    ```

  * `unless`

    ```javascript
    const add = flap
      .guard((a,b,c) => a + b + c)
      .unless({
        is   : (a,b,c) => a % 2 === 0,
        then : (a,b,c) => -1
      })

    add.value(2, 4, 6) // -> 12
    add.value(1, 3, 5) // -> -1
    ````

## Installation

  ```
  $ npm install flap
  ```

## Usage

  * Basic

    ```javascript
    import flap from 'flap'
    ```

    after `flap` is imported, you may optionally bind `guard` to all functions
    via `flap.bind` for a DSL-like syntax:

    ```javascript
    flap.bind()

    const divide = ((a,b) => a / b).guard.when({
      is   : (a,b) => b === 0,
      then : (a,b) => 'derp'
    })

    divide.value(10, 2) // -> 5
    divide.value(1, 0)  // -> 'derp'
    ```
    or, if you're more conservative, you can spare changes to `Function.prototype` and
    and just reference `flap.guard` directly:

    ```javascript
    const add1 = flap.guard((a,b) => a + b)
    const add2 = new flap.Guard((a,b) => a + b) // same as `add1`
    ```

  * Queries

    When `is` is not a `Function`, it will be interpreted as a [JsonPath](http://goessner.net/articles/JsonPath/) query:

    ```javascript
    flap.bind() // not required for querying, just some sugar

    // deeply searches for all hypermedia links with a defined href
    const links = (() => []).guard.when({
      is   : '$..link[?(@.href)]',
      then : (link) => link
    })

    links.value({ response: null })                // -> []
    links.value({ response: { link: null } })      // -> []
    links.value({ response: { link: '/v1/api' } }) // -> [{ link: '/v1/api' }]
    ```

## Contributing

  Contributions are always welcome! Simply open a PR with completely covered tests.

## TODO

 - [ ] `inject` - implicit dependency injection
 - [ ] documentation (guide)
