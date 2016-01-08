# Flap

> Guard clauses for readable conditions in JS

-----

## Features

 * Wraps JS functions and their arguments with [guard clauses](https://sourcemaking.com/refactoring/replace-nested-conditional-with-guard-clauses) found in languages such as Ruby and Elixir (particularly `when` and `unless`)
 * Improves readibility of complex conditions
 * Helps prevent deep nesting and callback hell

## Examples

  * `when`

    ```
    const slopePos = flap
      .guard((m,x,b) => (m * x) + b)
      .map((arg) => parseInt(arg))
      .when({
        is   : (a,b,c) => (m * x) < 0,
        then : (a,b,c) => 0
      })
      .after({
        then : (y) => Math.max(y, 90)
      })

    slopePos.value(-1, -1, 3)     // 0
    slopePos.value('1', '2.0', 3) // 6
    slopePos.value(100, 200, 300) // 100
    ```

  * `unless`

    ```
    const add = flap
      .guard((a,b,c) => a + b + c)
      .unless({
        is   : (a,b,c) => a % 2 === 0,
        then : (a,b,c) => -1
      })

    add.value(2, 4, 6) // 12
    add.value(1, 3, 5) // -1
    ````
