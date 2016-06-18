# flap

> :moyai: Guard clauses for ES6

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
 * Improves readability of complex conditions by allowing you to chain units of logic
 * Helps prevent deep nesting and callback hell
 * Optionally bind to `Function.prototype` for maximum sugar

## Examples

  * `when`

    This example also uses `map` to ensure all arguments are `Number`s and
    `after` to format the final result to 3 decimal places

    ```javascript
    const linear = flap
      .guard((m,x,b) => (m * x) + b)
      .map((arg) => parseInt(arg))
      .when({
        is   : (m,x,b) => (m * x) < 0,
        then : (m,x,b) => 0
      })
      .after((y) => y.constructor === Number ? y.toFixed(2) : 'invalid')

    linear(1, -1, 3)        // 0.00
    linear('1', '2.0', '3') // 5.00
    linear(-2, 2, 'foo')    // 'invalid'
    ```

  * `unless`

    ```javascript
    const add = flap
      .guard((a,b,c) => a + b + c)
      .unless({
        is   : (a,b,c) => a % 2 === 0,
        then : (a,b,c) => 'oddball'
      })

    add(2, 4, 6) // -> 12
    add(1, 3, 5) // -> 'oddball'
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

    divide(10, 2) // -> 5
    divide(1, 0)  // -> 'derp'
    ```
    or, if you're more conservative, you can spare changes to `Function.prototype` and
    and just reference `flap.guard` directly:

    ```javascript
    const add1 = flap.guard((a,b) => a + b)
    const add2 = new flap.Guard((a,b) => a + b) // same as `add1`
    ```

  * Queries

    When `is` is not a `Function`, it will be interpreted as a [json-where](http://npmjs.com/slurmulon/json-where/) pattern, which is simply a unification of the `json-pointer`, `json-path`, and `json-query` specifications.

    These specifications are extremely useful for performing complex / conditional searches on objects:

    ```javascript
    flap.bind() // not required for querying, just some sugar

    // deeply searches for all hypermedia links with a defined href
    const links = (() => []).guard.when({
      is   : '$..link[?(@.href)]',
      then : (link) => link
    })

    links({ response: null })                // -> []
    links({ response: { link: null } })      // -> []
    links({ response: { link: '/v1/api' } }) // -> [{ link: '/v1/api' }]
    ```

## Contributing

  Contributions are always welcome! Simply open a PR with completely covered tests.

  `npm run coverage`

## TODO

 - [ ] documentation (guide)

## License

MIT
