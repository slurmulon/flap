# Latch

> Guard clauses for readable conditions in JS

-----

## Features

 * Wraps JS functions and their respective arguments with guard clauses found in languages such as Ruby and Elixir (particularly `when` and `unless`)
 * Improves readibility of complex conditions
 * Helps prevent deep nesting and callback hell

## Examples

  * `when`

    ```javascript
    const add = latch
      .onto((a,b,c) => a + b + c)
      .when({
        is   : (a,b,c) => a % 2 === 0
        then : (a,b,c) => this.func(a, b, c) * 2
      })

    add.value(1, 2, 3) // 6
    add.value(2, 2, 3) // 14 (condition was met, multiplying result by 2)
    ```

  * `unless`

    ```javascript
    const add = latch
      .onto((a,b,c) => a + b + c)
      .unless({
        is   : (a,b,c) => a % 2 === 0
        then : (a,b,c) => -1
      })

    add.value(2, 4, 6) // 12
    add.value(1, 3, 5) // -1
    ````
