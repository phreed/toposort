toposort
=======

Topological sort implementation in JavaScript (aka, dependency sorting).

Given a collection of items each with dependencies on others 
provide a topological sort of the items.

## Usage

`toposort` expects an array of arrays. The inner arrays are typically two items each. For example, lets review this simplest example:

```ts
import {Toposort} from "toposort";
var nodes = [ [1, [2]], [2, [3]], [3, []] ];
var sorted = Toposort(nodes, 
    ());

// sorted = [1, 2, 3];
```

## JavaScript Support

The package is written in TypeScript and both the TypeScript and JavaScript files are included. 
TypeScript users can import the typed toposort function and benefit from typings whereas 
JavaScript users can use the JavaScript function normally and totally ignore the TypeScript files.

The JavaScript definition of `toposort` is:

```js
import topsort = require('toposort');
```
