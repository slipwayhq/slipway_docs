---
sidebar_position: 10
---

# Terminology

Before we go further we should get some basic terminology out of the way.

Below are brief descriptions of the most important terms, which we will explore more
throughout the documentation.

## Rig
In Slipway the thing which generates a dashboard is called a **Rig**. A Rig is a collection of **Components**
rigged together so that data flows between the Components (in a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph))
to produce outputs.

The output of any "leaf" Component (a Component which is not an input to any other Component) could
considered an output to the Rig. However usually we only want one output so we look for a
Component with a **handle** named `output` or `render`.

## Component
A Component is a piece of code which takes a JSON input and returns a JSON output.

Components can be written in Javascript, or any language which compiles to WASM, such as Rust.
They can be re-usable and shared publicly, or they can be entirely custom and private to you.

Re-usable components are what make Slipway so powerful, and allow others to quickly create their own
custom Rigs with very little code.

## Slipway Host
The program which is executing the Rig. The host handles tasks such as:
- Determining which components to run next.
- Validating component inputs and outputs.
- Validating permissions.
- Running the components.

Components can communicate with the host when they want to interact with the outside world, using the Host API.

## Component Handle
The name used to identify a specific instance of a Component within a Rig.
A Component can appear in a Rig multiple times, but given different handles to 
distinguish between them.

## Component Reference
Something that uniquely identifies a Component implementation.

It could be:
- an ID (e.g. `some_publisher.my_component.1.24.1`)
- an HTTPS URL (e.g. `https://example.com/my_component.tar`)
- a File URL (e.g. `file:components/my_component.tar`)

See [Component Registries](../guides/component-registries) for more information.
