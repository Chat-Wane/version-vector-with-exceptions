# version-vector-with-exceptions

<i>Keywords: Causality tracking, version vectors, exceptions, non-blocking</i>

This project provides a version vector with exceptions (VVwE) [1].

## Installation

```
$ npm install version-vector-with-exceptions
```
or
```
$ bower install version-vector-with-exceptions
```

## Usage

The module has been [browserified](http://browserify.org/) and
[uglified](https://github.com/mishoo/UglifyJS). To include the structure within
your browser, put the following line in your html:

```html
<script src='./version-vector-with-exceptions.bundle.js'></script>
```

In any case:
```javascript
var VVwE = require('version-vector-with-exceptions');

// #1 Initialize the causality tracking structure with the unique site
// identifier 42
var vvwe = new VVwE(42);

// #2 Update the local entry of the local vector. Return a pair
// {_e:entry, _c:counter} of the sender which uniquely identifies the operation
var ecVVwE = vvwe.increment();

// #3 Check if the operation has already been integrated
vvwe.isLower(ecVVwE);

// #4 Check if the operation is ready to be integrated
vvwe.isReady(entryAndCounter);

// #5 Increment the local vector with the entry clock of the received
// operation supposedly ready
vvwe.incrementFrom(entryAndCounter);

// #6 Merge with the version vector in argument
vvwe.merge(otherVVwE);

// #7 Clone the version vector with exception
var myClone = vvwe.clone();
```

## References

[1] [Concise version vectors in
WinFS](http://link.springer.com/chapter/10.1007/11561927_25)