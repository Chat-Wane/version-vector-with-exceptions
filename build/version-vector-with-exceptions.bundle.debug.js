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

},{"./pair.js":1,"./vvweentry.js":2,"sorted-cmp-array":3}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcGFpci5qcyIsImxpYi92dndlZW50cnkuanMiLCJub2RlX21vZHVsZXMvc29ydGVkLWNtcC1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0ZWQtY21wLWFycmF5L25vZGVfbW9kdWxlcy9iaW5hcnktc2VhcmNoL2luZGV4LmpzIiwibGliL3Z2d2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQTs7Ozs7O0lBR00sSTtBQUNGOzs7O0FBSUEsY0FBYSxLQUFiLEVBQW9CLE9BQXBCLEVBQTZCO0FBQUE7O0FBQ3pCLE9BQUssQ0FBTCxHQUFTLEtBQVQ7QUFDQSxPQUFLLENBQUwsR0FBUyxPQUFUO0FBQ0gsQzs7QUFFSjs7QUFFRCxPQUFPLE9BQVAsR0FBaUIsSUFBakI7OztBQ2pCQTs7QUFFQTs7Ozs7Ozs7Ozs7SUFNTSxTO0FBQ0Y7OztBQUdBLHVCQUFhLENBQWIsRUFBZ0I7QUFBQTs7QUFDWixhQUFLLENBQUwsR0FBUyxDQUFUO0FBQ0EsYUFBSyxDQUFMLEdBQVMsQ0FBVDtBQUNBLGFBQUssQ0FBTCxHQUFTLEVBQVQ7QUFDSDs7Ozs7O0FBRUQ7OztvQ0FHYTtBQUNULGlCQUFLLENBQUwsSUFBVSxDQUFWO0FBQ0g7Ozs7O0FBRUQ7Ozs7c0NBSWUsQyxFQUFHO0FBQ2Q7QUFDQSxnQkFBSSxJQUFJLEtBQUssQ0FBYixFQUFlO0FBQ1gsb0JBQU0sUUFBUSxLQUFLLENBQUwsQ0FBTyxPQUFQLENBQWUsQ0FBZixDQUFkO0FBQ0Esb0JBQUksU0FBUyxDQUFiLEVBQWdCO0FBQUU7QUFDZCx5QkFBSyxDQUFMLENBQU8sTUFBUCxDQUFjLEtBQWQsRUFBcUIsQ0FBckI7QUFDSDtBQUNKO0FBQ0Q7QUFDQSxnQkFBSSxNQUFPLEtBQUssQ0FBTCxHQUFTLENBQXBCLEVBQXdCO0FBQ3BCLHFCQUFLLENBQUwsSUFBVSxDQUFWO0FBQ0g7QUFDRDtBQUNBLGdC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QUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLENBQWhCLEVBQW1CLENBQW5CLEdBQXVCLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBNUM7QUFDQSxxQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLE9BQU8sTUFBUCxDQUFjLEdBQWQsQ0FBa0IsQ0FBbEIsRUFBcUIsQ0FBckIsQ0FBdUIsTUFBM0MsRUFBbUQsRUFBRSxDQUFyRCxFQUF3RDtBQUNwRCx5QkFBSyxNQUFMLENBQVksR0FBWixDQUFnQixDQUFoQixFQUFtQixDQUFuQixDQUFxQixJQUFyQixDQUEwQixPQUFPLE1BQVAsQ0FBYyxHQUFkLENBQWtCLENBQWxCLEVBQXFCLENBQXJCLENBQXVCLENBQXZCLENBQTFCO0FBQ0g7QUFDRCxvQkFBSSxPQUFPLE1BQVAsQ0FBYyxHQUFkLENBQWtCLENBQWxCLEVBQXFCLENBQXJCLEtBQTJCLE9BQU8sS0FBUCxDQUFhLENBQTVDLEVBQStDO0FBQzNDLHlCQUFLLEtBQUwsR0FBYSxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWdCLENBQWhCLENBQWI7QUFDSDtBQUNKO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7Ozs7QUFrR0o7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLElBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQYWlyIHRoYXQgZW5jYXBzdWxhdGVzIHRoZSByZXN1bHQgb2YgYW4gaW5jcmVtZW50IGluIHRoZSBhcnJheS5cbiAqL1xuY2xhc3MgUGFpciB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVudHJ5IFRoZSBlbnRyeSBpbmNyZW1lbnRlZC5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gY291bnRlciBUaGUgY291bnRlciBhc3NvY2lhdGVkIHRvIHRoYXQgZW50cnkuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKGVudHJ5LCBjb3VudGVyKSB7XG4gICAgICAgIHRoaXMuZSA9IGVudHJ5O1xuICAgICAgICB0aGlzLmMgPSBjb3VudGVyO1xuICAgIH07XG4gICAgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBhaXI7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogIENyZWF0ZSBhbiBlbnRyeSBvZiB0aGUgdmVyc2lvbiB2ZWN0b3Igd2l0aCBleGNlcHRpb25zIGNvbnRhaW5pbmcgdGhlIGluZGV4XG4gKiAgb2YgdGhlIGVudHJ5LCB0aGUgdmFsdWUgdiB0aGF0IGNyZWF0ZXMgYSBjb250aWd1b3VzIGludGVydmFsIGZyb20gMCB0byB2LFxuICogIGFuIGFycmF5IG9mIGludGVnZXJzIHRoYXQgY29udGFpbnMgdGhlIG9wZXJhdGlvbnMgbG93ZXIgdG8gdiB0aGF0IGhhdmUgbm90XG4gKiAgYmVlbiByZWNlaXZlZCB5ZXQuXG4gKi9cbmNsYXNzIFZWd0VFbnRyeSB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGUgVGhlIGVudHJ5IGluIHRoZSBpbnRlcnZhbCB2ZXJzaW9uIHZlY3Rvci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvciAoZSkge1xuICAgICAgICB0aGlzLmUgPSBlOyAgIFxuICAgICAgICB0aGlzLnYgPSAwO1xuICAgICAgICB0aGlzLnggPSBbXTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW5jcmVtZW50IHRoZSBsb2NhbCBjb3VudGVyLlxuICAgICAqL1xuICAgIGluY3JlbWVudCAoKSB7XG4gICAgICAgIHRoaXMudiArPSAxO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJbmNyZW1lbnQgZnJvbSBhIHJlbW90ZSBvcGVyYXRpb24uXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGMgdGhlIGNvdW50ZXIgb2YgdGhlIG9wZXJhdGlvbiB0byBhZGQgdG8gdGhpcy5cbiAgICAgKi9cbiAgICBpbmNyZW1lbnRGcm9tIChjKSB7XG4gICAgICAgIC8vICMxIGNoZWNrIGlmIHRoZSBjb3VudGVyIGlzIGluY2x1ZGVkIGluIHRoZSBleGNlcHRpb25zXG4gICAgICAgIGlmIChjIDwgdGhpcy52KXtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy54LmluZGV4T2YoYyk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gMCkgeyAvLyB0aGUgZXhjZXB0aW9uIGlzIGZvdW5kXG4gICAgICAgICAgICAgICAgdGhpcy54LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgICAgICAvLyAjMiBpZiB0aGUgdmFsdWUgaXMgKzEgY29tcGFyZWQgdG8gdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHZlY3RvclxuICAgICAgICBpZiAoYyA9PT0gKHRoaXMudiArIDEpKSB7XG4gICAgICAgICAgICB0aGlzLnYgKz0gMTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gIzMgb3RoZXJ3aXNlIGV4Y2VwdGlvbnMgYXJlIG1hZGVcbiAgICAgICAgaWYgKGMgPiAodGhpcy52ICsgMSkpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAodGhpcy52ICsgMSk7IGkgPCBjOyArK2kpe1xuICAgICAgICAgICAgICAgIHRoaXMueC5wdXNoKGkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMudiA9IGM7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIENvbXBhcmlzb24gZnVuY3Rpb24gYmV0d2VlbiB0d28gVlZ3RSBlbnRyaWVzLlxuICAgICAqIEBwYXJhbSB7VlZ3RUVudHJ5fSBhIFRoZSBmaXJzdCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7VlZ3RUVudHJ5fSBiIFRoZSBzZWNvbmQgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIC0xIGlmIGEgPCBiLCAxIGlmIGEgPiBiLCAwIG90aGVyd2lzZVxuICAgICAqL1xuICAgIHN0YXRpYyBjb21wYXJhdG9yIChhLCBiKSB7XG4gICAgICAgIGNvbnN0IGFFbnRyeSA9IChhLmUpIHx8IGE7XG4gICAgICAgIGNvbnN0IGJFbnRyeSA9IChiLmUpIHx8IGI7XG4gICAgICAgIGlmIChhRW50cnkgPCBiRW50cnkpIHsgcmV0dXJuIC0xOyB9O1xuICAgICAgICBpZiAoYUVudHJ5ID4gYkVudHJ5KXsgcmV0dXJuICAxOyB9O1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9O1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZWd0VFbnRyeTtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gU29ydGVkQXJyYXlcbnZhciBzZWFyY2ggPSByZXF1aXJlKCdiaW5hcnktc2VhcmNoJylcblxuZnVuY3Rpb24gU29ydGVkQXJyYXkoY21wLCBhcnIpIHtcbiAgaWYgKHR5cGVvZiBjbXAgIT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjb21wYXJhdG9yIG11c3QgYmUgYSBmdW5jdGlvbicpXG5cbiAgdGhpcy5hcnIgPSBhcnIgfHwgW11cbiAgdGhpcy5jbXAgPSBjbXBcbn1cblxuU29ydGVkQXJyYXkucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGluZGV4ID0gc2VhcmNoKHRoaXMuYXJyLCBlbGVtZW50LCB0aGlzLmNtcClcbiAgaWYgKGluZGV4IDwgMClcbiAgICBpbmRleCA9IH5pbmRleFxuXG4gIHRoaXMuYXJyLnNwbGljZShpbmRleCwgMCwgZWxlbWVudClcbn1cblxuU29ydGVkQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHZhciBpbmRleCA9IHNlYXJjaCh0aGlzLmFyciwgZWxlbWVudCwgdGhpcy5jbXApXG4gIHJldHVybiBpbmRleCA+PSAwXG4gICAgPyBpbmRleFxuICAgIDogLTFcbn1cblxuU29ydGVkQXJyYXkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGluZGV4ID0gc2VhcmNoKHRoaXMuYXJyLCBlbGVtZW50LCB0aGlzLmNtcClcbiAgaWYgKGluZGV4IDwgMClcbiAgICByZXR1cm4gZmFsc2VcblxuICB0aGlzLmFyci5zcGxpY2UoaW5kZXgsIDEpXG4gIHJldHVybiB0cnVlXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhheXN0YWNrLCBuZWVkbGUsIGNvbXBhcmF0b3IsIGxvdywgaGlnaCkge1xuICB2YXIgbWlkLCBjbXA7XG5cbiAgaWYobG93ID09PSB1bmRlZmluZWQpXG4gICAgbG93ID0gMDtcblxuICBlbHNlIHtcbiAgICBsb3cgPSBsb3d8MDtcbiAgICBpZihsb3cgPCAwIHx8IGxvdyA+PSBoYXlzdGFjay5sZW5ndGgpXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcImludmFsaWQgbG93ZXIgYm91bmRcIik7XG4gIH1cblxuICBpZihoaWdoID09PSB1bmRlZmluZWQpXG4gICAgaGlnaCA9IGhheXN0YWNrLmxlbmd0aCAtIDE7XG5cbiAgZWxzZSB7XG4gICAgaGlnaCA9IGhpZ2h8MDtcbiAgICBpZihoaWdoIDwgbG93IHx8IGhpZ2ggPj0gaGF5c3RhY2subGVuZ3RoKVxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJpbnZhbGlkIHVwcGVyIGJvdW5kXCIpO1xuICB9XG5cbiAgd2hpbGUobG93IDw9IGhpZ2gpIHtcbiAgICAvKiBOb3RlIHRoYXQgXCIobG93ICsgaGlnaCkgPj4+IDFcIiBtYXkgb3ZlcmZsb3csIGFuZCByZXN1bHRzIGluIGEgdHlwZWNhc3RcbiAgICAgKiB0byBkb3VibGUgKHdoaWNoIGdpdmVzIHRoZSB3cm9uZyByZXN1bHRzKS4gKi9cbiAgICBtaWQgPSBsb3cgKyAoaGlnaCAtIGxvdyA+PiAxKTtcbiAgICBjbXAgPSArY29tcGFyYXRvcihoYXlzdGFja1ttaWRdLCBuZWVkbGUpO1xuXG4gICAgLyogVG9vIGxvdy4gKi9cbiAgICBpZihjbXAgPCAwLjApIFxuICAgICAgbG93ICA9IG1pZCArIDE7XG5cbiAgICAvKiBUb28gaGlnaC4gKi9cbiAgICBlbHNlIGlmKGNtcCA+IDAuMClcbiAgICAgIGhpZ2ggPSBtaWQgLSAxO1xuICAgIFxuICAgIC8qIEtleSBmb3VuZC4gKi9cbiAgICBlbHNlXG4gICAgICByZXR1cm4gbWlkO1xuICB9XG5cbiAgLyogS2V5IG5vdCBmb3VuZC4gKi9cbiAgcmV0dXJuIH5sb3c7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFNvcnRlZEFycmF5ID0gcmVxdWlyZSgnc29ydGVkLWNtcC1hcnJheScpO1xuY29uc3QgVlZ3RUVudHJ5ID0gcmVxdWlyZSgnLi92dndlZW50cnkuanMnKTtcbmNvbnN0IFBhaXIgPSByZXF1aXJlKCcuL3BhaXIuanMnKTtcblxuLyoqXG4gKiBWZXJzaW9uIHZlY3RvciB3aXRoIGV4Y2VwdGlvbnMuXG4gKi9cbmNsYXNzIFZWd0Uge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlIFRoZSBlbnRyeSBjaG9zZW4gYnkgdGhlIGxvY2FsIHNpdGUuIE9uZSBlbnRyeSBwZXIgc2l0ZS5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihlKSB7XG4gICAgICAgIHRoaXMubG9jYWwgPSBuZXcgVlZ3RUVudHJ5KGUpO1xuICAgICAgICB0aGlzLnZlY3RvciA9IG5ldyBTb3J0ZWRBcnJheShWVndFRW50cnkuY29tcGFyYXRvcik7XG4gICAgICAgIHRoaXMudmVjdG9yLmluc2VydCh0aGlzLmxvY2FsKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2xvbmUgb2YgdGhpcyB2dndlLlxuICAgICAqIEByZXR1cm4ge1ZWd0V9IEEgdmVyc2lvbiB2ZWN0b3Igd2l0aCBleGNlcHRpb25zIGNvbnRhaW5pbmcgdGhlIHNhbWVcbiAgICAgKiBlbnRyeTsgY2xvY2s7IGV4Y2VwdGlvbnMgdHJpcGxlcy5cbiAgICAgKi9cbiAgICBjbG9uZSAoKSB7XG4gICAgICAgIGNvbnN0IGNsb25lVlZ3RSA9IG5ldyBWVndFKHRoaXMubG9jYWwuZSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy52ZWN0b3IuYXJyLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjbG9uZVZWd0UudmVjdG9yLmFycltpXSA9IG5ldyBWVndFRW50cnkodGhpcy52ZWN0b3IuYXJyW2ldLmUpO1xuICAgICAgICAgICAgY2xvbmVWVndFLnZlY3Rvci5hcnJbaV0udiA9IHRoaXMudmVjdG9yLmFycltpXS52O1xuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLnZlY3Rvci5hcnJbaV0ueC5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgIGNsb25lVlZ3RS52ZWN0b3IuYXJyW2ldLngucHVzaCh0aGlzLnZlY3Rvci5hcnJbaV0ueFtqXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGNsb25lVlZ3RS52ZWN0b3IuYXJyW2ldLmUgPT09IHRoaXMubG9jYWwuZSkge1xuICAgICAgICAgICAgICAgIGNsb25lVlZ3RS5sb2NhbCA9IGNsb25lVlZ3RS52ZWN0b3IuYXJyW2ldO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGNsb25lVlZ3RTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IGEgdmVyc2lvbiB2ZWN0b3Igd2l0aCBleGNlcHRpb25zIHVzaW5nIGEgSlNPTi5cbiAgICAgKiBAcmV0dXJuIHtWVndFfSBUaGUgdmVyc2lvbiB2ZWN0b3Igd2l0aCBleGNlcHRpb25zIGV4dHJhY3RlZCBmcm9tIHRoZVxuICAgICAqIEpTT04gaW4gYXJndW1lbnQuXG4gICAgICovXG4gICAgc3RhdGljIGZyb21KU09OIChvYmplY3QpIHtcbiAgICAgICAgY29uc3QgdnZ3ZSA9IG5ldyBWVndFKG9iamVjdC5sb2NhbC5lKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvYmplY3QudmVjdG9yLmFyci5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdnZ3ZS52ZWN0b3IuYXJyW2ldID0gbmV3IFZWd0VFbnRyeShvYmplY3QudmVjdG9yLmFycltpXS5lKTtcbiAgICAgICAgICAgIHZ2d2UudmVjdG9yLmFycltpXS52ID0gb2JqZWN0LnZlY3Rvci5hcnJbaV0udjtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgb2JqZWN0LnZlY3Rvci5hcnJbaV0ueC5sZW5ndGg7ICsraikge1xuICAgICAgICAgICAgICAgIHZ2d2UudmVjdG9yLmFycltpXS54LnB1c2gob2JqZWN0LnZlY3Rvci5hcnJbaV0ueFtqXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKG9iamVjdC52ZWN0b3IuYXJyW2ldLmUgPT09IG9iamVjdC5sb2NhbC5lKSB7XG4gICAgICAgICAgICAgICAgdnZ3ZS5sb2NhbCA9IHZ2d2UudmVjdG9yLmFycltpXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB2dndlO1xuICAgIH07XG4gICAgXG4gICAgLyoqXG4gICAgICogSW5jcmVtZW50IHRoZSBlbnRyeSBvZiB0aGUgdmVjdG9yIG9uIGxvY2FsIHVwZGF0ZS5cbiAgICAgKiBAcmV0dXJuIHtQYWlyfSBBIHBhaXIgdGhhdCB1bmlxdWVseSBpZGVudGlmaWVzIHRoZSBvcGVyYXRpb24uXG4gICAgICovXG4gICAgaW5jcmVtZW50ICgpIHtcbiAgICAgICAgdGhpcy5sb2NhbC5pbmNyZW1lbnQoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQYWlyKHRoaXMubG9jYWwuZSwgdGhpcy5sb2NhbC52KTsgXG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogSW5jcmVtZW50IGZyb20gYSByZW1vdGUgb3BlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7UGFpcn0gZWMgVGhlIGVudHJ5IGFuZCBjbG9jayBvZiB0aGUgcmVjZWl2ZWQgZXZlbnQgdG8gYWRkXG4gICAgICogc3VwcG9zZWRseSByZWFkeS5cbiAgICAgKi9cbiAgICBpbmNyZW1lbnRGcm9tIChlYykge1xuICAgICAgICAvLyAjMCBmaW5kIHRoZSBlbnRyeSB3aXRoaW4gdGhlIGFycmF5IG9mIFZWd0VudHJpZXNcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnZlY3Rvci5pbmRleE9mKGVjLmUpO1xuICAgICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgICAvLyAjMSBpZiB0aGUgZW50cnkgZG9lcyBub3QgZXhpc3QsIGluaXRpYWxpemUgYW5kIGluY3JlbWVudFxuICAgICAgICAgICAgdGhpcy52ZWN0b3IuaW5zZXJ0KG5ldyBWVndFRW50cnkoZWMuZSkpO1xuICAgICAgICAgICAgdGhpcy52ZWN0b3IuYXJyW3RoaXMudmVjdG9yLmluZGV4T2YoZWMuZSldLmluY3JlbWVudEZyb20oZWMuYyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAjMiBvdGhlcndpc2UsIG9ubHkgaW5jcmVtZW50XG4gICAgICAgICAgICB0aGlzLnZlY3Rvci5hcnJbaW5kZXhdLmluY3JlbWVudEZyb20oZWMuYyk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSBhcmd1bWVudCBhcmUgY2F1c2FsbHkgcmVhZHkgcmVnYXJkcyB0byB0aGlzIHZlY3Rvci4gIFxuICAgICAqIEBwYXJhbSB7UGFpcn0gZWMgVGhlIGlkZW50aWZpZXIsIGkuZS4sIHRoZSBzaXRlIGNsb2NrIG9mIHRoZSBvcGVyYXRpb25cbiAgICAgKiB0aGF0IGhhcHBlbmVkLWJlZm9yZSB0aGUgY3VycmVudCBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSB0cnVlIGlmIHRoZSBldmVudCBpcyByZWFkeSwgaS5lLiB0aGUgaWRlbnRpZmllciBoYXNcbiAgICAgKiBhbHJlYWR5IGJlZW4gaW50ZWdyYXRlZCB0byB0aGlzIHZlY3RvcjsgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIGlzUmVhZHkgKGVjKSB7XG4gICAgICAgIC8vICMwIG5vIGVjLCBhdXRvbWF0aWNhbGx5IHJlYWR5XG4gICAgICAgIGlmICh0eXBlb2YgZWMgPT09ICd1bmRlZmluZWQnIHx8IGVjID09PSBudWxsKSB7IHJldHVybiB0cnVlOyB9O1xuICAgICAgICAvLyAjMSBvdGhlcndpc2UsIGNoZWNrIGluIHRoZSB2ZWN0b3IgYW5kIGV4Y2VwdGlvbnNcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnZlY3Rvci5pbmRleE9mKGVjLmUpO1xuICAgICAgICByZXR1cm4gaW5kZXggPj0gMCAmJiBlYy5jIDw9IHRoaXMudmVjdG9yLmFycltpbmRleF0udiAmJlxuICAgICAgICAgICAgdGhpcy52ZWN0b3IuYXJyW2luZGV4XS54LmluZGV4T2YoZWMuYykgPCAwO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgbWVzc2FnZSBjb250YWlucyBpbmZvcm1hdGlvbiBhbHJlYWR5IGRlbGl2ZXJlZC5cbiAgICAgKiBAcGFyYW0ge1BhaXJ9IGVjIHRoZSBzaXRlIGNsb2NrIHRvIGNoZWNrLlxuICAgICAqL1xuICAgIGlzTG93ZXIgKGVjKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgZWMgIT09ICd1bmRlZmluZWQnICYmIGVjICE9PSBudWxsICYmIHRoaXMuaXNSZWFkeShlYyk7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBNZXJnZXMgdGhlIHZlcnNpb24gdmVjdG9yIGluIGFyZ3VtZW50IHdpdGggdGhpcy5cbiAgICAgKiBAcGFyYW0ge1ZWd0V9IG90aGVyIHRoZSBvdGhlciB2ZXJzaW9uIHZlY3RvciB0byBtZXJnZSB3aXRoLlxuICAgICAqL1xuICAgIG1lcmdlIChvdGhlcikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG90aGVyLnZlY3Rvci5hcnIubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IG90aGVyLnZlY3Rvci5hcnJbaV07XG4gICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLnZlY3Rvci5pbmRleE9mKGVudHJ5KTtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICAvLyAjMSBlbnRyeSBkb2VzIG5vdCBleGlzdCwgZnVsbHkgY29weSBpdFxuICAgICAgICAgICAgICAgIGxldCBuZXdFbnRyeSA9IG5ldyBWVndFRW50cnkoZW50cnkuZSk7XG4gICAgICAgICAgICAgICAgbmV3RW50cnkudiA9IGVudHJ5LnY7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBlbnRyeS54Lmxlbmd0aDsgKytqKXtcbiAgICAgICAgICAgICAgICAgICAgbmV3RW50cnkueC5wdXNoKGVudHJ5Lnhbal0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy52ZWN0b3IuaW5zZXJ0KG5ld0VudHJ5KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gIzIgb3RoZXJ3aXNlIG1lcmdlIHRoZSBlbnRyaWVzXG4gICAgICAgICAgICAgICAgbGV0IGN1cnJFbnRyeSA9IHRoaXMudmVjdG9yLmFycltpbmRleF07XG4gICAgICAgICAgICAgICAgLy8gIzJBIHJlbW92ZSB0aGUgZXhjZXB0aW9uIGZyb20gb3VyIHZlY3RvclxuICAgICAgICAgICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoaiA8IGN1cnJFbnRyeS54Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VyckVudHJ5Lnhbal08ZW50cnkudiAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkueC5pbmRleE9mKGN1cnJFbnRyeS54W2pdKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJFbnRyeS54LnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICsrajtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vICMyQiBhZGQgdGhlIG5ldyBleGNlcHRpb25zXG4gICAgICAgICAgICAgICAgaiA9IDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGogPCBlbnRyeS54Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZW50cnkueFtqXSA+IGN1cnJFbnRyeS52ICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyRW50cnkueC5pbmRleE9mKGVudHJ5Lnhbal0pIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VyckVudHJ5LngucHVzaChlbnRyeS54W2pdKTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgKytqO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY3VyckVudHJ5LnYgPSBNYXRoLm1heChjdXJyRW50cnkudiwgZW50cnkudik7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH07XG4gICAgXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZWd0U7XG5cbiJdfQ==
