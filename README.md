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

## Documentation

You can find detailed documentation and examples at [https://flap.js.org](https://flap.js.org).

## Contributing

Contributions are always welcome! Simply open a PR with completely covered tests.

```sh
npm run coverage
```

## License

MIT
