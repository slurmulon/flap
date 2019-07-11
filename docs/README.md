# flap

> :rooster: Guard clauses for JS

-----

## Summary

`flap` allows you to cleanly enforce integrity conditions and modifications to the inputs and outputs of functions.

You can also think of it as a generic datal-flow wrapper for functions, with a dash of pattern-matching awesomeness.

## Features

 * Wraps JS functions and their arguments with [guard clauses](https://sourcemaking.com/refactoring/replace-nested-conditional-with-guard-clauses) found in languages such as Elixir and Haskell
 * Elegantly modifies and reacts to arguments based on expressions
 * Pattern matching against object arguments
 * Improves readability of complex conditions by chaining discrete units of logic
 * Helps prevent deep nesting and callback hell
 * Optionally bind to `Function.prototype` for maximum sugar

## Installation

```sh
npm i flap
```

## Usage

### Basic

The most straight-forward usage is to simply import `flap` and then use `flap.guard` to wrap your functions: 

```javascript
import flap from 'flap'

const sum = (...args) => args.reduce((acc, val) => acc + val)
const p10sum = flap.guard(total).map(arg => arg + 10)

sum(1, 2, 3) // 6
p10sum(1, 2, 3) // 36
```

### Sugar

If you want to avoid explicitly referencing `flap` everywhere, you may optionally bind `guard` to all functions via `flap.bind()` for a DSL-like syntax:

```javascript
flap.bind()

const yIntercept = ((m,x,b) => (m * x) + b)
  .guard
  .map(arg => parseInt(arg))
  .when({
    is   : (m,x,b) => (m * x) < 0,
    then : (m,x,b) => 0
  })
  .after(y => typeof y === 'number' ? y.toFixed(2) : 'invalid')

yIntercept(1, -1, 3)        // 0.00
yIntercept('1', '2.0', '3') // 5.00
yIntercept(-2, 2, 'foo')    // 'invalid'
```

### Patterns

When `is` is **not** a `Function`, it will be interpreted as a [json-where](https://npmjs.com/json-where/) pattern

`json-where` is simply a transparent unification of the `json-pointer`, `json-path`, and `json-query` specifications.

These specifications are extremely useful for performing complex / conditional matches on objects:

```javascript
import axios from 'axios'

// Follows  any object (i.e. calls GET) with an `href` property
const follow = (() => []).guard.when({
  is   : '$.href',
  then : (...links) => Promise.all(links.map(
    link => axios.get(link.href)
  ))
})

follow(null) // -> []
follow({ junk: true }) // -> []
follow({ href: '/v1/api/user/1'}, { junk: true }) // -> Promised GET to '/v1/api/user/1'
```

## API

### `when`

All of the other guards are based on `when`, so it is certainly the most important and powerful guard.

This guard accepts an object with two properties: `is` and `then`:

```js
when({
  is: function | string,
  then: function
})
```

If the value of `is` is a function that returns a truthy value, the `then` function is called
and the return value of that function is used instead of the original guarded function's return value.

If the value of `is` is a string, it will be interpreted as a [`json-where`](https://npmjs.com/json-where) pattern,
and the `then` function is called only with the arguments that match the `is` pattern.

In either case, `when`'s `then` function is only ever invoked if `is` matches against the provided arguments.

### `unless`

Invokes the original guarded function unless the `is` condition is met.

Otherwise the `then` function is invoked and its return value will be used instead.

```js
const example = ((a,b,c) => a + b + c).guard.unless({
  is   : (a,b,c) => a % 2 === 0,
  then : (a,b,c) => 1
})

example(3,2,1) // 1
example(4,3,2) // 9
```

### `all`

### `any`

### `before`

### `after`

### `map`

### `filter`

### `abort`
