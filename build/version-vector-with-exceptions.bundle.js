require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Pair that encapsulates the result of an increment in the array.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Pair =
/**
 * @param {Object} entry The entry incremented.
 * @param {Number} counter The counter associated to that entry.
 */
function Pair(entry, counter) {
  _classCallCheck(this, Pair);

  this.e = entry;
  this.c = counter;
};

;

module.exports = Pair;

},{}],2:[function(require,module,exports){
'use strict';

/**
 *  Create an entry of the version vector with exceptions containing the index
 *  of the entry, the value v that creates a contiguous interval from 0 to v,
 *  an array of integers that contains the operations lower to v that have not
 *  been received yet.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VVwEEntry = function () {
    /**
     * @param {Object} e The entry in the interval version vector.
     */
    function VVwEEntry(e) {
        _classCallCheck(this, VVwEEntry);

        this.e = e;
        this.v = 0;
        this.x = [];
    }

    _createClass(VVwEEntry, [{
        key: 'increment',


        /**
         * Increment the local counter.
         */
        value: function increment() {
            this.v += 1;
        }
    }, {
        key: 'incrementFrom',


        /**
         * Increment from a remote operation.
         * @param {Number} c the counter of the operation to add to this.
         */
        value: function incrementFrom(c) {
            // #1 check if the counter is included in the exceptions
            if (c < this.v) {
                var index = this.x.indexOf(c);
                if (index >= 0) {
                    // the exception is found
                    this.x.splice(index, 1);
                };
            };
            // #2 if the value is +1 compared to the current value of the vector
            if (c === this.v + 1) {
                this.v += 1;
            };
            // #3 otherwise exceptions are made
            if (c > this.v + 1) {
                for (var i = this.v + 1; i < c; ++i) {
                    this.x.push(i);
                };
                this.v = c;
            };
        }
    }], [{
        key: 'comparator',


        /**
         * Comparison function between two VVwE entries.
         * @param {VVwEEntry} a The first element.
         * @param {VVwEEntry} b The second element.
         * @return -1 if a < b, 1 if a > b, 0 otherwise
         */
        value: function comparator(a, b) {
            var aEntry = a.e || a;
            var bEntry = b.e || b;
            if (aEntry < bEntry) {
                return -1;
            };
            if (aEntry > bEntry) {
                return 1;
            };
            return 0;
        }
    }]);

    return VVwEEntry;
}();

;

module.exports = VVwEEntry;

},{}],3:[function(require,module,exports){
'use strict';
module.exports = SortedArray
var search = require('binary-search')

function SortedArray(cmp, arr) {
  if (typeof cmp != 'function')
    throw new TypeError('comparator must be a function')

  this.arr = arr || []
  this.cmp = cmp
}

SortedArray.prototype.insert = function(element) {
  var index = search(this.arr, element, this.cmp)
  if (index < 0)
    index = ~index

  this.arr.splice(index, 0, element)
}

SortedArray.prototype.indexOf = function(element) {
  var index = search(this.arr, element, this.cmp)
  return index >= 0
    ? index
    : -1
}

SortedArray.prototype.remove = function(element) {
  var index = search(this.arr, element, this.cmp)
  if (index < 0)
    return false

  this.arr.splice(index, 1)
  return true
}

},{"binary-search":4}],4:[function(require,module,exports){
module.exports = function(haystack, needle, comparator, low, high) {
  var mid, cmp;

  if(low === undefined)
    low = 0;

  else {
    low = low|0;
    if(low < 0 || low >= haystack.length)
      throw new RangeError("invalid lower bound");
  }

  if(high === undefined)
    high = haystack.length - 1;

  else {
    high = high|0;
    if(high < low || high >= haystack.length)
      throw new RangeError("invalid upper bound");
  }

  while(low <= high) {
    /* Note that "(low + high) >>> 1" may overflow, and results in a typecast
     * to double (which gives the wrong results). */
    mid = low + (high - low >> 1);
    cmp = +comparator(haystack[mid], needle);

    /* Too low. */
    if(cmp < 0.0) 
      low  = mid + 1;

    /* Too high. */
    else if(cmp > 0.0)
      high = mid - 1;
    
    /* Key found. */
    else
      return mid;
  }

  /* Key not found. */
  return ~low;
}

},{}],"version-vector-with-exceptions":[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SortedArray = require('sorted-cmp-array');
var VVwEEntry = require('./vvweentry.js');
var Pair = require('./pair.js');

/**
 * Version vector with exceptions.
 */

var VVwE = function () {
    /**
     * @param {Object} e The entry chosen by the local site. One entry per site.
     */
    function VVwE(e) {
        _classCallCheck(this, VVwE);

        this.local = new VVwEEntry(e);
        this.vector = new SortedArray(VVwEEntry.comparator);
        this.vector.insert(this.local);
    }

    _createClass(VVwE, [{
        key: 'clone',


        /**
         * Clone of this vvwe.
         * @return {VVwE} A version vector with exceptions containing the same
         * entry; clock; exceptions triples.
         */
        value: function clone() {
            var cloneVVwE = new VVwE(this.local.e);
            for (var i = 0; i < this.vector.arr.length; ++i) {
                cloneVVwE.vector.arr[i] = new VVwEEntry(this.vector.arr[i].e);
                cloneVVwE.vector.arr[i].v = this.vector.arr[i].v;
                for (var j = 0; j < this.vector.arr[i].x.length; ++j) {
                    cloneVVwE.vector.arr[i].x.push(this.vector.arr[i].x[j]);
                };
                if (cloneVVwE.vector.arr[i].e === this.local.e) {
                    cloneVVwE.local = cloneVVwE.vector.arr[i];
                };
            };
            return cloneVVwE;
        }
    }, {
        key: 'increment',


        /**
         * Increment the entry of the vector on local update.
         * @return {Pair} A pair that uniquely identifies the operation.
         */
        value: function increment() {
            this.local.increment();
            return new Pair(this.local.e, this.local.v);
        }
    }, {
        key: 'incrementFrom',


        /**
         * Increment from a remote operation.
         * @param {Pair} ec The entry and clock of the received event to add
         * supposedly ready.
         */
        value: function incrementFrom(ec) {
            // #0 find the entry within the array of VVwEntries
            var index = this.vector.indexOf(ec.e);
            if (index < 0) {
                // #1 if the entry does not exist, initialize and increment
                this.vector.insert(new VVwEEntry(ec.e));
                this.vector.arr[this.vector.indexOf(ec.e)].incrementFrom(ec.c);
            } else {
                // #2 otherwise, only increment
                this.vector.arr[index].incrementFrom(ec.c);
            };
        }
    }, {
        key: 'isReady',


        /**
         * Check if the argument are causally ready regards to this vector.  
         * @param {Pair} ec The identifier, i.e., the site clock of the operation
         * that happened-before the current event.
         * @return {Boolean} true if the event is ready, i.e. the identifier has
         * already been integrated to this vector; false otherwise.
         */
        value: function isReady(ec) {
            // #0 no ec, automatically ready
            if (typeof ec === 'undefined' || ec === null) {
                return true;
            };
            // #1 otherwise, check in the vector and exceptions
            var index = this.vector.indexOf(ec.e);
            return index >= 0 && ec.c <= this.vector.arr[index].v && this.vector.arr[index].x.indexOf(ec.c) < 0;
        }
    }, {
        key: 'isLower',


        /**
         * Check if the message contains information already delivered.
         * @param {Pair} ec the site clock to check.
         */
        value: function isLower(ec) {
            return typeof ec !== 'undefined' && ec !== null && this.isReady(ec);
        }
    }, {
        key: 'merge',


        /**
         * Merges the version vector in argument with this.
         * @param {VVwE} other the other version vector to merge with.
         */
        value: function merge(other) {
            for (var i = 0; i < other.vector.arr.length; ++i) {
                var entry = other.vector.arr[i];
                var index = this.vector.indexOf(entry);
                if (index < 0) {
                    // #1 entry does not exist, fully copy it
                    var newEntry = new VVwEEntry(entry.e);
                    newEntry.v = entry.v;
                    for (var j = 0; j < entry.x.length; ++j) {
                        newEntry.x.push(entry.x[j]);
                    };
                    this.vector.insert(newEntry);
                } else {
                    // #2 otherwise merge the entries
                    var currEntry = this.vector.arr[index];
                    // #2A remove the exception from our vector
                    var _j = 0;
                    while (_j < currEntry.x.length) {
                        if (currEntry.x[_j] < entry.v && entry.x.indexOf(currEntry.x[_j]) < 0) {
                            currEntry.x.splice(_j, 1);
                        } else {
                            ++_j;
                        };
                    };
                    // #2B add the new exceptions
                    _j = 0;
                    while (_j < entry.x.length) {
                        if (entry.x[_j] > currEntry.v && currEntry.x.indexOf(entry.x[_j]) < 0) {
                            currEntry.x.push(entry.x[_j]);
                        };
                        ++_j;
                    };
                    currEntry.v = Math.max(currEntry.v, entry.v);
                };
            };
        }
    }], [{
        key: 'fromJSON',


        /**
         * Get a version vector with exceptions using a JSON.
         * @return {VVwE} The version vector with exceptions extracted from the
         * JSON in argument.
         */
        value: function fromJSON(object) {
            var vvwe = new VVwE(object.local.e);
            for (var i = 0; i < object.vector.arr.length; ++i) {
                vvwe.vector.arr[i] = new VVwEEntry(object.vector.arr[i].e);
                vvwe.vector.arr[i].v = object.vector.arr[i].v;
                for (var j = 0; j < object.vector.arr[i].x.length; ++j) {
                    vvwe.vector.arr[i].x.push(object.vector.arr[i].x[j]);
                };
                if (object.vector.arr[i].e === object.local.e) {
                    vvwe.local = vvwe.vector.arr[i];
                };
            };
            return vvwe;
        }
    }]);

    return VVwE;
}();

;

module.exports = VVwE;

},{"./pair.js":1,"./vvweentry.js":2,"sorted-cmp-array":3}]},{},[]);
