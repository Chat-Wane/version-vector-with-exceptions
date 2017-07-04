# version-vector-with-exceptions

*Keywords: Causality tracking, version vectors, exceptions, non-blocking*

This project provides a Version Vector with Exceptions (VVwE) or concise vectors
[1].

## Installation

```
$ npm install version-vector-with-exceptions
```

## Usage

To include VVwE within your web browser, put the following line in your
html:

```html
<script src='./version-vector-with-exceptions.bundle.js'></script>
```

In your JavaScript file:

```javascript
const VVwE = require('version-vector-with-exceptions');
```

## Example

```javascript
// #1 Initialize the causality tracking structure with the unique site
// identifier 42
const vvwe = new VVwE(42);

// #2 Update the local entry of the local vector. Return a pair
// {e:entry, c:counter} of the sender which uniquely identifies the operation
const ec = vvwe.increment();

// #3 Check if the operation has already been integrated
vvwe.isLower(ec);

// #4 Check if the operation is ready to be integrated
vvwe.isReady(ec);

// #5 Increment the local vector with the entry clock of the received
// operation supposedly ready
vvwe.incrementFrom(ec);

// #6 Merge with the version vector in argument
vvwe.merge(otherVVwE);

// #7 Clone the version vector with exception
let myClone = vvwe.clone();
```

## References

[1] D. Malkhi, and D. Terry. [Concise version vectors in
WinFS](http://link.springer.com/chapter/10.1007/11561927_25), *Distributed
Computing*, 20(3):209–219, 2007.