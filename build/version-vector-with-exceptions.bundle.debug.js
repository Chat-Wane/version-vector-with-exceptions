require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*!
  \brief create an entry of the version vector with exceptions containing the
  index of the entry, the value v that creates a contiguous interval
  from 0 to v, an array of integers that contain the operations lower to v that
  have not been received yet
  \param e the entry in the interval version vector
*/
function VVwEEntry(e){
    this.e = e;   
    this.v = 0;
    this.x = [];
};

/*!
 * \brief local counter incremented
 */
VVwEEntry.prototype.increment = function(){
    this.v += 1;
};

/**
 * \brief increment from a remote operation
 * \param c the counter of the operation to add to this 
 */
VVwEEntry.prototype.incrementFrom = function(c){
    // #1 check if the counter is included in the exceptions
    if (c < this.v){
        var index = this.x.indexOf(c);
        if (index>=0){ // the exception is found
            this.x.splice(index, 1);
        };
    };
    // #2 if the value is +1 compared to the current value of the vector
    if (c == (this.v + 1)){
        this.v += 1;
    };
    // #3 otherwise exception are made
    if (c > (this.v + 1)){
        for (var i = (this.v + 1); i<c; ++i){
            this.x.push(i);
        };
        this.v = c;
    };
};

/*!
 * \brief comparison function between two VVwE entries
 * \param a the first element
 * \param b the second element
 * \return -1 if a < b, 1 if a > b, 0 otherwise
 */
function Comparator (a, b){
    var aEntry = (a.e) || a;
    var bEntry = (b.e) || b;
    if (aEntry < bEntry){ return -1; };
    if (aEntry > bEntry){ return  1; };
    return 0;
};

module.exports = VVwEEntry;
module.exports.Comparator = Comparator;

},{}],2:[function(require,module,exports){
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

},{"binary-search":3}],3:[function(require,module,exports){
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
var SortedArray = require('sorted-cmp-array');
var Comparator = require('./vvweentry.js').Comparator;
var VVwEEntry = require('./vvweentry.js');

/**
 * \class VVwE
 * \brief class version vector with exception keeps track of events in a 
 * concise way
 * \param e the entry chosen by the local site (1 entry <-> 1 site)
 */
function VVwE(e){
    this.local = new VVwEEntry(e);
    this.vector = new SortedArray(Comparator);
    this.vector.insert(this.local);
};

/*!
 * \brief clone of this vvwe
 */
VVwE.prototype.clone = function(){
    var cloneVVwE = new VVwE(this.local.e);
    for (var i=0; i<this.vector.arr.length; ++i){
        cloneVVwE.vector.arr[i] = new VVwEEntry(this.vector.arr[i].e);
        cloneVVwE.vector.arr[i].v = this.vector.arr[i].v;
        for (var j=0; j<this.vector.arr[i].x.length; ++j){
            cloneVVwE.vector.arr[i].x.push(this.vector.arr[i].x[j]);
        };
        if (cloneVVwE.vector.arr[i].e === this.local.e){
            cloneVVwE.local = cloneVVwE.vector.arr[i];
        };
    };
    return cloneVVwE;
};

/**
 * \brief increment the entry of the vector on local update
 * \return {_e: entry, _c: counter} uniquely identifying the operation
 */
VVwE.prototype.increment = function(){
    this.local.increment();
    return {_e: this.local.e, _c:this.local.v}; 
};


/**
 * \brief increment from a remote operation
 * \param ec the entry and clock of the received event to add supposedly rdy
 * the type is {_e: entry, _c: counter}
 */
VVwE.prototype.incrementFrom = function (ec){
    // #0 find the entry within the array of VVwEntries
    var index = this.vector.indexOf(ec._e);
    if (index < 0){
        // #1 if the entry does not exist, initialize and increment
        this.vector.insert(new VVwEEntry(ec._e));
        this.vector.arr[this.vector.indexOf(ec._e)].incrementFrom(ec._c);
    } else {
        // #2 otherwise, only increment
        this.vector[index].incrementFrom(ec._c);
    };
};


/**
 * \brief check if the argument are causally ready regards to this vector
 * \param ec the site clock that happen-before the current event
 */
VVwE.prototype.isReady = function(ec){
    var ready = !ec;
    if (!ready){
        var index = this.vector.indexOf(ec._e);
        ready = index >=0 && ec._c <= this.vector.arr[index].v &&
            this.vector.arr[index].x.indexOf(ec._c)<0;
    };
    return ready;
};

/**
 * \brief check if the message contains information already delivered
 * \param ec the site clock to check
 */
VVwE.prototype.isLower = function(ec){
    return (ec && this.isReady(ec));
};

/**
 * \brief merge the version vector in argument with this
 * \param other the other version vector to merge
 */
VVwE.prototype.merge = function(other){
    for (var i = 0; i < other.vector.arr.length; ++i){
        var entry = other.vector.arr[i];
        var index = this.vector.indexOf(entry);
        if (index < 0){
            // #1 entry does not exist, fully copy it
            var newEntry = new VVwEEntry(entry.e);
            newEntry.v = entry.v;
            for (var j = 0; j < entry.x.length; ++j){
                newEntry.x.push(entry.x[j]);
            };
            this.vector.insert(newEntry);
        }else{
            // #2 otherwise merge the entries
            var currEntry = this.vector.arr[i];
            // #2A remove the exception from our vector
            var j = 0;
            while (j<currEntry.x.length){
                if (currEntry.x[j]<entry.v &&
                    entry.x.indexOf(currEntry.x[j])<0){
                    currEntry.splice(j, 1);
                } else {
                    ++j;
                };
            };
            // #2B add the new exceptions
            j = 0;
            while (j<entry.x.length){
                if (entry.x[j] > currEntry.v &&
                    currEntry.x.indexOf(entry.x[j])<0){
                    currEntry.x.push(entry.x[j]);
                };
                ++j;
            };
            currEntry.v = Math.max(currEntry.v, entry.v);
        };
    };
};

module.exports = VVwE;


},{"./vvweentry.js":1,"sorted-cmp-array":2}]},{},[])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi92dndlZW50cnkuanMiLCJub2RlX21vZHVsZXMvc29ydGVkLWNtcC1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0ZWQtY21wLWFycmF5L25vZGVfbW9kdWxlcy9iaW5hcnktc2VhcmNoL2luZGV4LmpzIiwibGliL3Z2d2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qIVxuICBcXGJyaWVmIGNyZWF0ZSBhbiBlbnRyeSBvZiB0aGUgdmVyc2lvbiB2ZWN0b3Igd2l0aCBleGNlcHRpb25zIGNvbnRhaW5pbmcgdGhlXG4gIGluZGV4IG9mIHRoZSBlbnRyeSwgdGhlIHZhbHVlIHYgdGhhdCBjcmVhdGVzIGEgY29udGlndW91cyBpbnRlcnZhbFxuICBmcm9tIDAgdG8gdiwgYW4gYXJyYXkgb2YgaW50ZWdlcnMgdGhhdCBjb250YWluIHRoZSBvcGVyYXRpb25zIGxvd2VyIHRvIHYgdGhhdFxuICBoYXZlIG5vdCBiZWVuIHJlY2VpdmVkIHlldFxuICBcXHBhcmFtIGUgdGhlIGVudHJ5IGluIHRoZSBpbnRlcnZhbCB2ZXJzaW9uIHZlY3RvclxuKi9cbmZ1bmN0aW9uIFZWd0VFbnRyeShlKXtcbiAgICB0aGlzLmUgPSBlOyAgIFxuICAgIHRoaXMudiA9IDA7XG4gICAgdGhpcy54ID0gW107XG59O1xuXG4vKiFcbiAqIFxcYnJpZWYgbG9jYWwgY291bnRlciBpbmNyZW1lbnRlZFxuICovXG5WVndFRW50cnkucHJvdG90eXBlLmluY3JlbWVudCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy52ICs9IDE7XG59O1xuXG4vKipcbiAqIFxcYnJpZWYgaW5jcmVtZW50IGZyb20gYSByZW1vdGUgb3BlcmF0aW9uXG4gKiBcXHBhcmFtIGMgdGhlIGNvdW50ZXIgb2YgdGhlIG9wZXJhdGlvbiB0byBhZGQgdG8gdGhpcyBcbiAqL1xuVlZ3RUVudHJ5LnByb3RvdHlwZS5pbmNyZW1lbnRGcm9tID0gZnVuY3Rpb24oYyl7XG4gICAgLy8gIzEgY2hlY2sgaWYgdGhlIGNvdW50ZXIgaXMgaW5jbHVkZWQgaW4gdGhlIGV4Y2VwdGlvbnNcbiAgICBpZiAoYyA8IHRoaXMudil7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMueC5pbmRleE9mKGMpO1xuICAgICAgICBpZiAoaW5kZXg+PTApeyAvLyB0aGUgZXhjZXB0aW9uIGlzIGZvdW5kXG4gICAgICAgICAgICB0aGlzLnguc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIC8vICMyIGlmIHRoZSB2YWx1ZSBpcyArMSBjb21wYXJlZCB0byB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgdmVjdG9yXG4gICAgaWYgKGMgPT0gKHRoaXMudiArIDEpKXtcbiAgICAgICAgdGhpcy52ICs9IDE7XG4gICAgfTtcbiAgICAvLyAjMyBvdGhlcndpc2UgZXhjZXB0aW9uIGFyZSBtYWRlXG4gICAgaWYgKGMgPiAodGhpcy52ICsgMSkpe1xuICAgICAgICBmb3IgKHZhciBpID0gKHRoaXMudiArIDEpOyBpPGM7ICsraSl7XG4gICAgICAgICAgICB0aGlzLngucHVzaChpKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy52ID0gYztcbiAgICB9O1xufTtcblxuLyohXG4gKiBcXGJyaWVmIGNvbXBhcmlzb24gZnVuY3Rpb24gYmV0d2VlbiB0d28gVlZ3RSBlbnRyaWVzXG4gKiBcXHBhcmFtIGEgdGhlIGZpcnN0IGVsZW1lbnRcbiAqIFxccGFyYW0gYiB0aGUgc2Vjb25kIGVsZW1lbnRcbiAqIFxccmV0dXJuIC0xIGlmIGEgPCBiLCAxIGlmIGEgPiBiLCAwIG90aGVyd2lzZVxuICovXG5mdW5jdGlvbiBDb21wYXJhdG9yIChhLCBiKXtcbiAgICB2YXIgYUVudHJ5ID0gKGEuZSkgfHwgYTtcbiAgICB2YXIgYkVudHJ5ID0gKGIuZSkgfHwgYjtcbiAgICBpZiAoYUVudHJ5IDwgYkVudHJ5KXsgcmV0dXJuIC0xOyB9O1xuICAgIGlmIChhRW50cnkgPiBiRW50cnkpeyByZXR1cm4gIDE7IH07XG4gICAgcmV0dXJuIDA7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZWd0VFbnRyeTtcbm1vZHVsZS5leHBvcnRzLkNvbXBhcmF0b3IgPSBDb21wYXJhdG9yO1xuIiwiJ3VzZSBzdHJpY3QnO1xubW9kdWxlLmV4cG9ydHMgPSBTb3J0ZWRBcnJheVxudmFyIHNlYXJjaCA9IHJlcXVpcmUoJ2JpbmFyeS1zZWFyY2gnKVxuXG5mdW5jdGlvbiBTb3J0ZWRBcnJheShjbXAsIGFycikge1xuICBpZiAodHlwZW9mIGNtcCAhPSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NvbXBhcmF0b3IgbXVzdCBiZSBhIGZ1bmN0aW9uJylcblxuICB0aGlzLmFyciA9IGFyciB8fCBbXVxuICB0aGlzLmNtcCA9IGNtcFxufVxuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICB2YXIgaW5kZXggPSBzZWFyY2godGhpcy5hcnIsIGVsZW1lbnQsIHRoaXMuY21wKVxuICBpZiAoaW5kZXggPCAwKVxuICAgIGluZGV4ID0gfmluZGV4XG5cbiAgdGhpcy5hcnIuc3BsaWNlKGluZGV4LCAwLCBlbGVtZW50KVxufVxuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGluZGV4ID0gc2VhcmNoKHRoaXMuYXJyLCBlbGVtZW50LCB0aGlzLmNtcClcbiAgcmV0dXJuIGluZGV4ID49IDBcbiAgICA/IGluZGV4XG4gICAgOiAtMVxufVxuXG5Tb3J0ZWRBcnJheS5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICB2YXIgaW5kZXggPSBzZWFyY2godGhpcy5hcnIsIGVsZW1lbnQsIHRoaXMuY21wKVxuICBpZiAoaW5kZXggPCAwKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIHRoaXMuYXJyLnNwbGljZShpbmRleCwgMSlcbiAgcmV0dXJuIHRydWVcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaGF5c3RhY2ssIG5lZWRsZSwgY29tcGFyYXRvciwgbG93LCBoaWdoKSB7XG4gIHZhciBtaWQsIGNtcDtcblxuICBpZihsb3cgPT09IHVuZGVmaW5lZClcbiAgICBsb3cgPSAwO1xuXG4gIGVsc2Uge1xuICAgIGxvdyA9IGxvd3wwO1xuICAgIGlmKGxvdyA8IDAgfHwgbG93ID49IGhheXN0YWNrLmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiaW52YWxpZCBsb3dlciBib3VuZFwiKTtcbiAgfVxuXG4gIGlmKGhpZ2ggPT09IHVuZGVmaW5lZClcbiAgICBoaWdoID0gaGF5c3RhY2subGVuZ3RoIC0gMTtcblxuICBlbHNlIHtcbiAgICBoaWdoID0gaGlnaHwwO1xuICAgIGlmKGhpZ2ggPCBsb3cgfHwgaGlnaCA+PSBoYXlzdGFjay5sZW5ndGgpXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcImludmFsaWQgdXBwZXIgYm91bmRcIik7XG4gIH1cblxuICB3aGlsZShsb3cgPD0gaGlnaCkge1xuICAgIC8qIE5vdGUgdGhhdCBcIihsb3cgKyBoaWdoKSA+Pj4gMVwiIG1heSBvdmVyZmxvdywgYW5kIHJlc3VsdHMgaW4gYSB0eXBlY2FzdFxuICAgICAqIHRvIGRvdWJsZSAod2hpY2ggZ2l2ZXMgdGhlIHdyb25nIHJlc3VsdHMpLiAqL1xuICAgIG1pZCA9IGxvdyArIChoaWdoIC0gbG93ID4+IDEpO1xuICAgIGNtcCA9ICtjb21wYXJhdG9yKGhheXN0YWNrW21pZF0sIG5lZWRsZSk7XG5cbiAgICAvKiBUb28gbG93LiAqL1xuICAgIGlmKGNtcCA8IDAuMCkgXG4gICAgICBsb3cgID0gbWlkICsgMTtcblxuICAgIC8qIFRvbyBoaWdoLiAqL1xuICAgIGVsc2UgaWYoY21wID4gMC4wKVxuICAgICAgaGlnaCA9IG1pZCAtIDE7XG4gICAgXG4gICAgLyogS2V5IGZvdW5kLiAqL1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBtaWQ7XG4gIH1cblxuICAvKiBLZXkgbm90IGZvdW5kLiAqL1xuICByZXR1cm4gfmxvdztcbn1cbiIsInZhciBTb3J0ZWRBcnJheSA9IHJlcXVpcmUoJ3NvcnRlZC1jbXAtYXJyYXknKTtcbnZhciBDb21wYXJhdG9yID0gcmVxdWlyZSgnLi92dndlZW50cnkuanMnKS5Db21wYXJhdG9yO1xudmFyIFZWd0VFbnRyeSA9IHJlcXVpcmUoJy4vdnZ3ZWVudHJ5LmpzJyk7XG5cbi8qKlxuICogXFxjbGFzcyBWVndFXG4gKiBcXGJyaWVmIGNsYXNzIHZlcnNpb24gdmVjdG9yIHdpdGggZXhjZXB0aW9uIGtlZXBzIHRyYWNrIG9mIGV2ZW50cyBpbiBhIFxuICogY29uY2lzZSB3YXlcbiAqIFxccGFyYW0gZSB0aGUgZW50cnkgY2hvc2VuIGJ5IHRoZSBsb2NhbCBzaXRlICgxIGVudHJ5IDwtPiAxIHNpdGUpXG4gKi9cbmZ1bmN0aW9uIFZWd0UoZSl7XG4gICAgdGhpcy5sb2NhbCA9IG5ldyBWVndFRW50cnkoZSk7XG4gICAgdGhpcy52ZWN0b3IgPSBuZXcgU29ydGVkQXJyYXkoQ29tcGFyYXRvcik7XG4gICAgdGhpcy52ZWN0b3IuaW5zZXJ0KHRoaXMubG9jYWwpO1xufTtcblxuLyohXG4gKiBcXGJyaWVmIGNsb25lIG9mIHRoaXMgdnZ3ZVxuICovXG5WVndFLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNsb25lVlZ3RSA9IG5ldyBWVndFKHRoaXMubG9jYWwuZSk7XG4gICAgZm9yICh2YXIgaT0wOyBpPHRoaXMudmVjdG9yLmFyci5sZW5ndGg7ICsraSl7XG4gICAgICAgIGNsb25lVlZ3RS52ZWN0b3IuYXJyW2ldID0gbmV3IFZWd0VFbnRyeSh0aGlzLnZlY3Rvci5hcnJbaV0uZSk7XG4gICAgICAgIGNsb25lVlZ3RS52ZWN0b3IuYXJyW2ldLnYgPSB0aGlzLnZlY3Rvci5hcnJbaV0udjtcbiAgICAgICAgZm9yICh2YXIgaj0wOyBqPHRoaXMudmVjdG9yLmFycltpXS54Lmxlbmd0aDsgKytqKXtcbiAgICAgICAgICAgIGNsb25lVlZ3RS52ZWN0b3IuYXJyW2ldLngucHVzaCh0aGlzLnZlY3Rvci5hcnJbaV0ueFtqXSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChjbG9uZVZWd0UudmVjdG9yLmFycltpXS5lID09PSB0aGlzLmxvY2FsLmUpe1xuICAgICAgICAgICAgY2xvbmVWVndFLmxvY2FsID0gY2xvbmVWVndFLnZlY3Rvci5hcnJbaV07XG4gICAgICAgIH07XG4gICAgfTtcbiAgICByZXR1cm4gY2xvbmVWVndFO1xufTtcblxuLyoqXG4gKiBcXGJyaWVmIGluY3JlbWVudCB0aGUgZW50cnkgb2YgdGhlIHZlY3RvciBvbiBsb2NhbCB1cGRhdGVcbiAqIFxccmV0dXJuIHtfZTogZW50cnksIF9jOiBjb3VudGVyfSB1bmlxdWVseSBpZGVudGlmeWluZyB0aGUgb3BlcmF0aW9uXG4gKi9cblZWd0UucHJvdG90eXBlLmluY3JlbWVudCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5sb2NhbC5pbmNyZW1lbnQoKTtcbiAgICByZXR1cm4ge19lOiB0aGlzLmxvY2FsLmUsIF9jOnRoaXMubG9jYWwudn07IFxufTtcblxuXG4vKipcbiAqIFxcYnJpZWYgaW5jcmVtZW50IGZyb20gYSByZW1vdGUgb3BlcmF0aW9uXG4gKiBcXHBhcmFtIGVjIHRoZSBlbnRyeSBhbmQgY2xvY2sgb2YgdGhlIHJlY2VpdmVkIGV2ZW50IHRvIGFkZCBzdXBwb3NlZGx5IHJkeVxuICogdGhlIHR5cGUgaXMge19lOiBlbnRyeSwgX2M6IGNvdW50ZXJ9XG4gKi9cblZWd0UucHJvdG90eXBlLmluY3JlbWVudEZyb20gPSBmdW5jdGlvbiAoZWMpe1xuICAgIC8vICMwIGZpbmQgdGhlIGVudHJ5IHdpdGhpbiB0aGUgYXJyYXkgb2YgVlZ3RW50cmllc1xuICAgIHZhciBpbmRleCA9IHRoaXMudmVjdG9yLmluZGV4T2YoZWMuX2UpO1xuICAgIGlmIChpbmRleCA8IDApe1xuICAgICAgICAvLyAjMSBpZiB0aGUgZW50cnkgZG9lcyBub3QgZXhpc3QsIGluaXRpYWxpemUgYW5kIGluY3JlbWVudFxuICAgICAgICB0aGlzLnZlY3Rvci5pbnNlcnQobmV3IFZWd0VFbnRyeShlYy5fZSkpO1xuICAgICAgICB0aGlzLnZlY3Rvci5hcnJbdGhpcy52ZWN0b3IuaW5kZXhPZihlYy5fZSldLmluY3JlbWVudEZyb20oZWMuX2MpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICMyIG90aGVyd2lzZSwgb25seSBpbmNyZW1lbnRcbiAgICAgICAgdGhpcy52ZWN0b3JbaW5kZXhdLmluY3JlbWVudEZyb20oZWMuX2MpO1xuICAgIH07XG59O1xuXG5cbi8qKlxuICogXFxicmllZiBjaGVjayBpZiB0aGUgYXJndW1lbnQgYXJlIGNhdXNhbGx5IHJlYWR5IHJlZ2FyZHMgdG8gdGhpcyB2ZWN0b3JcbiAqIFxccGFyYW0gZWMgdGhlIHNpdGUgY2xvY2sgdGhhdCBoYXBwZW4tYmVmb3JlIHRoZSBjdXJyZW50IGV2ZW50XG4gKi9cblZWd0UucHJvdG90eXBlLmlzUmVhZHkgPSBmdW5jdGlvbihlYyl7XG4gICAgdmFyIHJlYWR5ID0gIWVjO1xuICAgIGlmICghcmVhZHkpe1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnZlY3Rvci5pbmRleE9mKGVjLl9lKTtcbiAgICAgICAgcmVhZHkgPSBpbmRleCA+PTAgJiYgZWMuX2MgPD0gdGhpcy52ZWN0b3IuYXJyW2luZGV4XS52ICYmXG4gICAgICAgICAgICB0aGlzLnZlY3Rvci5hcnJbaW5kZXhdLnguaW5kZXhPZihlYy5fYyk8MDtcbiAgICB9O1xuICAgIHJldHVybiByZWFkeTtcbn07XG5cbi8qKlxuICogXFxicmllZiBjaGVjayBpZiB0aGUgbWVzc2FnZSBjb250YWlucyBpbmZvcm1hdGlvbiBhbHJlYWR5IGRlbGl2ZXJlZFxuICogXFxwYXJhbSBlYyB0aGUgc2l0ZSBjbG9jayB0byBjaGVja1xuICovXG5WVndFLnByb3RvdHlwZS5pc0xvd2VyID0gZnVuY3Rpb24oZWMpe1xuICAgIHJldHVybiAoZWMgJiYgdGhpcy5pc1JlYWR5KGVjKSk7XG59O1xuXG4vKipcbiAqIFxcYnJpZWYgbWVyZ2UgdGhlIHZlcnNpb24gdmVjdG9yIGluIGFyZ3VtZW50IHdpdGggdGhpc1xuICogXFxwYXJhbSBvdGhlciB0aGUgb3RoZXIgdmVyc2lvbiB2ZWN0b3IgdG8gbWVyZ2VcbiAqL1xuVlZ3RS5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbihvdGhlcil7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdGhlci52ZWN0b3IuYXJyLmxlbmd0aDsgKytpKXtcbiAgICAgICAgdmFyIGVudHJ5ID0gb3RoZXIudmVjdG9yLmFycltpXTtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy52ZWN0b3IuaW5kZXhPZihlbnRyeSk7XG4gICAgICAgIGlmIChpbmRleCA8IDApe1xuICAgICAgICAgICAgLy8gIzEgZW50cnkgZG9lcyBub3QgZXhpc3QsIGZ1bGx5IGNvcHkgaXRcbiAgICAgICAgICAgIHZhciBuZXdFbnRyeSA9IG5ldyBWVndFRW50cnkoZW50cnkuZSk7XG4gICAgICAgICAgICBuZXdFbnRyeS52ID0gZW50cnkudjtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW50cnkueC5sZW5ndGg7ICsrail7XG4gICAgICAgICAgICAgICAgbmV3RW50cnkueC5wdXNoKGVudHJ5Lnhbal0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMudmVjdG9yLmluc2VydChuZXdFbnRyeSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgLy8gIzIgb3RoZXJ3aXNlIG1lcmdlIHRoZSBlbnRyaWVzXG4gICAgICAgICAgICB2YXIgY3VyckVudHJ5ID0gdGhpcy52ZWN0b3IuYXJyW2ldO1xuICAgICAgICAgICAgLy8gIzJBIHJlbW92ZSB0aGUgZXhjZXB0aW9uIGZyb20gb3VyIHZlY3RvclxuICAgICAgICAgICAgdmFyIGogPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGo8Y3VyckVudHJ5LngubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckVudHJ5Lnhbal08ZW50cnkudiAmJlxuICAgICAgICAgICAgICAgICAgICBlbnRyeS54LmluZGV4T2YoY3VyckVudHJ5Lnhbal0pPDApe1xuICAgICAgICAgICAgICAgICAgICBjdXJyRW50cnkuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICsrajtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vICMyQiBhZGQgdGhlIG5ldyBleGNlcHRpb25zXG4gICAgICAgICAgICBqID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChqPGVudHJ5LngubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBpZiAoZW50cnkueFtqXSA+IGN1cnJFbnRyeS52ICYmXG4gICAgICAgICAgICAgICAgICAgIGN1cnJFbnRyeS54LmluZGV4T2YoZW50cnkueFtqXSk8MCl7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJFbnRyeS54LnB1c2goZW50cnkueFtqXSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICArK2o7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY3VyckVudHJ5LnYgPSBNYXRoLm1heChjdXJyRW50cnkudiwgZW50cnkudik7XG4gICAgICAgIH07XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVlZ3RTtcblxuIl19
