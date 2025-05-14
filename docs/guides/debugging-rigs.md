---
sidebar_position: 40
---

# Debugging Rigs

## Slipway Debugger

Slipway comes with a built-in debugger to help you diagnose problems with Rigs.

To demonstrate this, we'll create a mock Rig using the built-in special Component `passthrough`:
::json[Test]{file=mock_rig.json}

The `passthough` component simply passes the Component's input through to its output.

If you run this using `slipway run` you will see the following output:
```
> slipway run mock_rig.json
Launching mock_rig.json

◩ animals         ┆  569fab51             ┆  24 bytes
│─◩ start         ┆  b54b3a01             ┆  20 bytes
├─┴─□ first_half  ┆                       ┆
└───┴─□ final     ┆                       ┆

Running "start"...
Running "animals"...

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  42ns  of 42ns
│─■ start         ┆  b54b3a01 ➜ b54b3a01  ┆  20 bytes ➜ 20 bytes  ┆  333ns of 333ns
├─┴─◩ first_half  ┆  0e5dbab3             ┆  43 bytes
└───┴─□ final     ┆                       ┆

Running "first_half"...

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  42ns  of 42ns
│─■ start         ┆  b54b3a01 ➜ b54b3a01  ┆  20 bytes ➜ 20 bytes  ┆  333ns of 333ns
├─┴─■ first_half  ┆  0e5dbab3 ➜ 0e5dbab3  ┆  43 bytes ➜ 43 bytes  ┆  166ns of 166ns
└───┴─◩ final     ┆  3889234e             ┆  91 bytes

Running "final"...
No more components to run.

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  42ns  of 42ns
│─■ start         ┆  b54b3a01 ➜ b54b3a01  ┆  20 bytes ➜ 20 bytes  ┆  333ns of 333ns
├─┴─■ first_half  ┆  0e5dbab3 ➜ 0e5dbab3  ┆  43 bytes ➜ 43 bytes  ┆  166ns of 166ns
└───┴─■ final     ┆  3889234e ➜ 3889234e  ┆  91 bytes ➜ 91 bytes  ┆  208ns of 208ns

Component "final" output:
{
  "line_1": "The quick",
  "line_2": "brown fox",
  "line_3": "jumped over the",
  "line_4": "brown fox"
}
```

The output is showing the current state of the Rig as each component is evaluated.

Take for example the following section of the output:
```
■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  42ns  of 42ns
│─■ start         ┆  b54b3a01 ➜ b54b3a01  ┆  20 bytes ➜ 20 bytes  ┆  333ns of 333ns
├─┴─◩ first_half  ┆  0e5dbab3             ┆  43 bytes
└───┴─□ final     ┆                       ┆
```

Each line represents a Component referenced in the Rig:
- The lines on the far left draw the dependencies between the Components.
  - Lines connecting to the side of a Component are inputs.
  - Lines coming from the bottom of a Component are outputs.
- The box represents the component state:
  - `□` indicates the Component does not yet have either an input nor an output.
  - `◩` indicates the Component has an input, but there is no output yet.
  - `■` indicates the Component has both an input and an output.
  - `◪` indicates the Component has no input, but does have an output (this can happen if the output is overridden in
        the debugger).
- The Component handle is displayed in the first column, after the box.
- The second column shows the input and output hashes.
  - If the hashes have a `➜` symbol that means the input directly led to the output.
  - If the hashes have a `!` symbol that means the output was overridden.
- The third column shows the input and output data sizes.
- The forth column shows the Component execution time.
  - The format `x of y` indicates the Component took `y` time to execute overall, of which `x` was spent running
    the Component's code. These may be different if, for example, the component needs to be JIT compiled before execution.

After the Rig has finished executing, the result of the Component with handle `final` is output.
Only leaf node Component results are output.
A leaf node is a Component whose output is not used by any other Component.

There is a problem here: The last line output from `final` should be "lazy dog", not "brown fox".
Obviously the mistake here is trivial, but it works as a debugging exercise.

Let's step through each Component using the Slipway debugger.

Run the following command:
```sh
slipway debug mock_rig.json
```

You will see some output and a new terminal prompt:
```
> slipway debug mock_rig.json
Debugging mock_rig.json

◩ animals         ┆  569fab51             ┆  24 bytes
│─◩ start         ┆  b54b3a01             ┆  20 bytes
├─┴─□ first_half  ┆                       ┆
└───┴─□ final     ┆                       ┆

Type help for commands.
⛵️ >>
```

The output matches the first set of output you saw when running the rig above.
It is the state of the Rig before any Components have been run.

The state shows us that `animals` and `start` are both able to run, because they
have inputs (neither depend on any other Components).

What the above text doesn't show is that in the terminal the four handles are partially underlined as follows:

- <u>a</u>nimals
- <u>s</u>tart
- <u>f</u>irst_half
- <u>fi</u>nal

The underlines are shortcuts.
Instead of writing out the entire handle when debugging, we can just write the underlined part.
As there are two handles beginning with `f`, the shortcuts are `f` for the first and `fi` for the second.

Let's run the component `start` using its shortcut:

```sh
run s
```

We now see:

```
⛵️ >> run s

◩ animals         ┆  569fab51             ┆  24 bytes
│─■ start         ┆  b54b3a01 ➜ b54b3a01  ┆  20 bytes ➜ 20 bytes  ┆  5µs of 5µs
├─┴─□ first_half  ┆                       ┆
└───┴─□ final     ┆                       ┆

⛵️ >>
```

Now we can see that `start` has been run, and has an output.

We can view the output of `start`:

```sh
output s
```

This will open the output in a the text editor (using the [edit crate](https://lib.rs/crates/edit)).

If you simply close the file, then you will return to the debugger in the same state as before.

However if you make changes and save the file, then you will override the output of the Component.
This is useful for quickly testing changes to the output of one Component to see how it affects
downstream Components.

If you change the text in the JSON from `The quick` to `The quickish`, then save and close the file,
you will see the following output:

```
◩ animals         ┆  569fab51             ┆  24 bytes
│─■ start         ┆  b54b3a01 ! f9f77ed9  ┆  20 bytes ! 23 bytes  ┆  7µs of 7µs
├─┴─□ first_half  ┆                       ┆
└───┴─□ final     ┆                       ┆

⛵️ >>
```

Note the `!` in the second and third columns, indicating that the input did _not_ directly lead to the output.
In your terminal you'll also see that the hash and sizes to the right of the `!` are underlined, indicating
it is the output that has been overridden.

Let's run `animals` next. We don't need to use the shortcut `a` if we don't want to:

```sh
run animals
```

You will see the output:
```
⛵️ >> run animals

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  117µs of 117µs
│─■ start         ┆  b54b3a01 ! f9f77ed9  ┆  20 bytes ! 23 bytes  ┆  7µs   of 7µs
├─┴─◩ first_half  ┆  2c87db9d             ┆  46 bytes
└───┴─□ final     ┆                       ┆

⛵️ >>
```

Now the Component `first_half` is able to run, as both its input Components have outputs.

Let's run it:

```
⛵️ >> run f

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  117µs of 117µs
│─■ start         ┆  b54b3a01 ! f9f77ed9  ┆  20 bytes ! 23 bytes  ┆  7µs   of 7µs
├─┴─■ first_half  ┆  2c87db9d ➜ 2c87db9d  ┆  46 bytes ➜ 46 bytes  ┆  3µs   of 3µs
└───┴─◩ final     ┆  706d487d             ┆  94 bytes

⛵️ >>
```

View it's output:

```
output f
```

You will see the output that incorporates our changes to the output of `start`:
```json
{
  "line_1": "The quickish",
  "line_2": "brown fox"
}
```

Close the output of `first_half`, and run `final`:

```
⛵️ >> run fi

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  117µs of 117µs
│─■ start         ┆  b54b3a01 ! f9f77ed9  ┆  20 bytes ! 23 bytes  ┆  7µs   of 7µs
├─┴─■ first_half  ┆  2c87db9d ➜ 2c87db9d  ┆  46 bytes ➜ 46 bytes  ┆  3µs   of 3µs
└───┴─■ final     ┆  706d487d ➜ 706d487d  ┆  94 bytes ➜ 94 bytes  ┆  3µs   of 3µs

⛵️ >>
```

The Rig is now complete, but we are still in the debugger.

If you look at the output of final with `output fi` you'll see our incorrect output:
```json
{
  "line_1": "The quickish",
  "line_2": "brown fox",
  "line_3": "jumped over the",
  "line_4": "brown fox"
}
```

Close the output. Let's try and fix it.

First let's look at the output of `animals` by running `output a`:

```json
[
  "brown fox",
  "lazy dog"
]
```

Ok, the last line of our `final` component output should be "lazy dog", which is at index `1`.
Close the output without changing it.

Next let's look at the input of `final`:

```sh
input fi
```

A text editor opens with the following:
```json
{
  "line_1": "$$.first_half.line_1",
  "line_2": "$$.first_half.line_2",
  "line_3": "jumped over the",
  "line_4": "$$.animals[0]"
}
```

Hmm, out last line is pointing at index `0`, not index `1`. Let's change that:

```json
{
  "line_1": "$$.first_half.line_1",
  "line_2": "$$.first_half.line_2",
  "line_3": "jumped over the",
  "line_4": "$$.animals[1]"
}
```

Save and close the file. You'll see the following in the debugger:
```
■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  117µs of 117µs
│─■ start         ┆  b54b3a01 ! f9f77ed9  ┆  20 bytes ! 23 bytes  ┆  7µs   of 7µs
├─┴─■ first_half  ┆  2c87db9d ➜ 2c87db9d  ┆  46 bytes ➜ 46 bytes  ┆  3µs   of 3µs
└───┴─■ final     ┆  cd9bade0 ! 706d487d  ┆  93 bytes ! 94 bytes  ┆  3µs   of 3µs

⛵️ >>
```

The `final` Component now has a `!` symbol in the second and third columns, and the input
has and size is underlined, indicating the input is overridden.

In addition, the _output_ of `final` will be red in your terminal, indicating it is stale.

Let's re-run it:

```
⛵️ >> run fi

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  117µs of 117µs
│─■ start         ┆  b54b3a01 ! f9f77ed9  ┆  20 bytes ! 23 bytes  ┆  7µs   of 7µs
├─┴─■ first_half  ┆  2c87db9d ➜ 2c87db9d  ┆  46 bytes ➜ 46 bytes  ┆  3µs   of 3µs
└───┴─■ final     ┆  cd9bade0 ➜ cd9bade0  ┆  93 bytes ➜ 93 bytes  ┆  7µs   of 7µs

⛵️ >>
```

The output will be similar to before, but now the `!` for final has turned back into 
an arrow, indicating the output derives from the input, and the output is green.
The input is still underlined, indicating it is still overridden.

View the output of `final` again:
```
output fi
```

You'll see the following JSON:

```
{
  "line_1": "The quickish",
  "line_2": "brown fox",
  "line_3": "jumped over the",
  "line_4": "lazy dog"
}
```

Great! We've fixed the problem!
Note that we've only fixed it in the debugger, we still need to go back and modify the Rig file if we want to keep the fix.

## Additional commands

Before we stop, there are a few useful debugger commands we haven't used yet.

### `--clear`

Let's look at the help for the `output` command:

```
output --help
```

You'll see the following:

```
⛵️ >> output --help
Override or view the output of a component

Usage:  output [OPTIONS] <HANDLE>

Arguments:
  <HANDLE>  The component to update

Options:
  -c, --clear  Clear the output override
  -h, --help   Print help
```

Note there is a `--clear` option. We can use that to clear our overridden output to the `start` Component:

```
⛵️ >> output s --clear

■ animals         ┆  569fab51 ➜ 569fab51  ┆  24 bytes ➜ 24 bytes  ┆  117µs of 117µs
│─■ start         ┆  b54b3a01 ➜ b54b3a01  ┆  20 bytes ➜ 20 bytes  ┆  7µs   of 7µs
├─┴─■ first_half  ┆  0e5dbab3 ! 2c87db9d  ┆  43 bytes ! 46 bytes  ┆  3µs   of 3µs
└───┴─■ final     ┆  cd9bade0 ➜ cd9bade0  ┆  93 bytes ➜ 93 bytes  ┆  7µs   of 7µs
```

You'll see that we've now invalidated the output of `first_half`:
It's output is red, and it has an `!` indicating the output does not derive from it's new input.

Run `first_half` and the output of `final` will be similarly invalidated, so run that as well and inspect its output:
```sh
run f
run fi
output fi
```

You'll see our final output JSON, exactly as we want it:
```json
{
  "line_1": "The quick",
  "line_2": "brown fox",
  "line_3": "jumped over the",
  "line_4": "lazy dog"
}
```

### `render`

Another command we haven't used is the `render` command.

```
⛵️ >> render --help
Render the output of a component

Usage:  render [OPTIONS] <HANDLE>

Arguments:
  <HANDLE>  The component to render

Options:
  -s, --save <SAVE>  The optional file path to save the rendered output
  -h, --help         Print help
```

If the component outputs a canvas, this will render the output as an image to the command line.
If your terminal doesn't support inline images, or you want to save it as a file, you can use the
`--save` option and specify a file path.

### `exit`

Finally, when you want to exit the debugger, simply type `exit`.

## Generated Debug Rigs

Sometimes you want to debug a Component but the problematic Component is being run from inside
[the rigging of another Component](/docs/basics/components#rigging).
Other times the Component might be being run by another Component through [the Host API](/docs/basics/host-api#run-components).

The `slipway debug` command isn't able to step inside Components to run these deeply embedded Components in isolation.
We could create a new Rig to try and isolate the problematic Component, and debug that instead, but doing that can be time consuming
and challenging.

Instead can generate a "debug" Rig.
This flattens the entire Rig, including all Component executions made within other Components,
into a series of root level Component calls with their inputs fully resolved to JSON.

To demonstrate this, let's create a Rig which uses both Fragment components and callouts to the Host API:

::json[Test]{file=debug_rig_example.json}

This Rig calls the `slipwayhq.render` component, and asks it to render a image generated by calling the
`slipwayhq.echarts` component, which returns a chart using some hard-coded data.

The `slipwayhq.echarts` Component is a Fragment Component, that internally calls the `slipwayhq.echarts_svg` 
and `slipwayhq.svg` Components.

If you were to debug this rig:

```
slipway debug --allow-fonts --allow-registry-components debug_rig_example.json
```

All you would see is the root `render` Component:

```
Debugging debug_rig_example.json

◩ render  ┆  6818153c             ┆  655 bytes

Type help for commands.
⛵️ >>
```

Not very useful if we want to debug the `echarts_svg` Component.

Lets generate a debug rig from this:

```
slipway run --output-debug-rig "debug_rig_example_generated.json" --allow-fonts --allow-registry-components debug_rig_example.json
```

This runs the Rig and outputs a debug rig called `debug_rig_example_generated.json`.

Let's debug that Rig instead:

```
slipway debug --allow-fonts --allow-registry-components debug_rig_example_generated.json
```

This is what we now see:
```
Debugging debug_rig_example_generated.json

◩ render                            ┆  6818153c             ┆  655 bytes
◩ render_then_echarts_then_echarts  ┆  dad81b3d             ┆  204 bytes
◩ render_then_echarts_then_input    ┆  dad81b3d             ┆  204 bytes
◩ render_then_echarts_then_output   ┆  39cd9b81             ┆    6.50 kb

Type help for commands.
⛵️ >>
```

We now have four Component handles we can run, representing each time a Component was run in the original Rig.
Each handle contains the fully resolved input for that Component, taken from the instant we ran the Component when
we generated the debug Rig.
This means there are no longer dependencies between the handles, and each can be inspected and run immediately
in the debugger.

Permissions of each Component are also preserved by specifying the full permission chain for each Component.
This ensures that each Component in a debug Rig is only able to do as much as it could do in the original Rig.

Note that because each Component in a debug Rig contains the fully resolved input, the Rig files can get quite large.

The full generated debug Rig is shown below for completeness:

::json[Test]{file=debug_rig_example_generated.json}

