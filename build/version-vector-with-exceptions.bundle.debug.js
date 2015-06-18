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

VVwE.prototype.fromJSON = function(object){
    for (var i=0; i<object.vector.arr.length; ++i){
        this.vector.arr[i] = new VVwEEntry(object.vector.arr[i].e);
        this.vector.arr[i].v = object.vector.arr[i].v;
        for (var j=0; j<object.vector.arr[i].x.length; ++j){
            this.vector.arr[i].x.push(object.vector.arr[i].x[j]);
        };
        if (object.vector.arr[i].e === object.local.e){
            this.local = this.vector.arr[i];
        };
    };
    return this;
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
        this.vector.arr[index].incrementFrom(ec._c);
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
                    currEntry.x.splice(j, 1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImxpYi92dndlZW50cnkuanMiLCJub2RlX21vZHVsZXMvc29ydGVkLWNtcC1hcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9zb3J0ZWQtY21wLWFycmF5L25vZGVfbW9kdWxlcy9iaW5hcnktc2VhcmNoL2luZGV4LmpzIiwibGliL3Z2d2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXG4vKiFcbiAgXFxicmllZiBjcmVhdGUgYW4gZW50cnkgb2YgdGhlIHZlcnNpb24gdmVjdG9yIHdpdGggZXhjZXB0aW9ucyBjb250YWluaW5nIHRoZVxuICBpbmRleCBvZiB0aGUgZW50cnksIHRoZSB2YWx1ZSB2IHRoYXQgY3JlYXRlcyBhIGNvbnRpZ3VvdXMgaW50ZXJ2YWxcbiAgZnJvbSAwIHRvIHYsIGFuIGFycmF5IG9mIGludGVnZXJzIHRoYXQgY29udGFpbiB0aGUgb3BlcmF0aW9ucyBsb3dlciB0byB2IHRoYXRcbiAgaGF2ZSBub3QgYmVlbiByZWNlaXZlZCB5ZXRcbiAgXFxwYXJhbSBlIHRoZSBlbnRyeSBpbiB0aGUgaW50ZXJ2YWwgdmVyc2lvbiB2ZWN0b3JcbiovXG5mdW5jdGlvbiBWVndFRW50cnkoZSl7XG4gICAgdGhpcy5lID0gZTsgICBcbiAgICB0aGlzLnYgPSAwO1xuICAgIHRoaXMueCA9IFtdO1xufTtcblxuLyohXG4gKiBcXGJyaWVmIGxvY2FsIGNvdW50ZXIgaW5jcmVtZW50ZWRcbiAqL1xuVlZ3RUVudHJ5LnByb3RvdHlwZS5pbmNyZW1lbnQgPSBmdW5jdGlvbigpe1xuICAgIHRoaXMudiArPSAxO1xufTtcblxuLyoqXG4gKiBcXGJyaWVmIGluY3JlbWVudCBmcm9tIGEgcmVtb3RlIG9wZXJhdGlvblxuICogXFxwYXJhbSBjIHRoZSBjb3VudGVyIG9mIHRoZSBvcGVyYXRpb24gdG8gYWRkIHRvIHRoaXMgXG4gKi9cblZWd0VFbnRyeS5wcm90b3R5cGUuaW5jcmVtZW50RnJvbSA9IGZ1bmN0aW9uKGMpe1xuICAgIC8vICMxIGNoZWNrIGlmIHRoZSBjb3VudGVyIGlzIGluY2x1ZGVkIGluIHRoZSBleGNlcHRpb25zXG4gICAgaWYgKGMgPCB0aGlzLnYpe1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnguaW5kZXhPZihjKTtcbiAgICAgICAgaWYgKGluZGV4Pj0wKXsgLy8gdGhlIGV4Y2VwdGlvbiBpcyBmb3VuZFxuICAgICAgICAgICAgdGhpcy54LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvLyAjMiBpZiB0aGUgdmFsdWUgaXMgKzEgY29tcGFyZWQgdG8gdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIHZlY3RvclxuICAgIGlmIChjID09ICh0aGlzLnYgKyAxKSl7XG4gICAgICAgIHRoaXMudiArPSAxO1xuICAgIH07XG4gICAgLy8gIzMgb3RoZXJ3aXNlIGV4Y2VwdGlvbiBhcmUgbWFkZVxuICAgIGlmIChjID4gKHRoaXMudiArIDEpKXtcbiAgICAgICAgZm9yICh2YXIgaSA9ICh0aGlzLnYgKyAxKTsgaTxjOyArK2kpe1xuICAgICAgICAgICAgdGhpcy54LnB1c2goaSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudiA9IGM7XG4gICAgfTtcbn07XG5cbi8qIVxuICogXFxicmllZiBjb21wYXJpc29uIGZ1bmN0aW9uIGJldHdlZW4gdHdvIFZWd0UgZW50cmllc1xuICogXFxwYXJhbSBhIHRoZSBmaXJzdCBlbGVtZW50XG4gKiBcXHBhcmFtIGIgdGhlIHNlY29uZCBlbGVtZW50XG4gKiBcXHJldHVybiAtMSBpZiBhIDwgYiwgMSBpZiBhID4gYiwgMCBvdGhlcndpc2VcbiAqL1xuZnVuY3Rpb24gQ29tcGFyYXRvciAoYSwgYil7XG4gICAgdmFyIGFFbnRyeSA9IChhLmUpIHx8IGE7XG4gICAgdmFyIGJFbnRyeSA9IChiLmUpIHx8IGI7XG4gICAgaWYgKGFFbnRyeSA8IGJFbnRyeSl7IHJldHVybiAtMTsgfTtcbiAgICBpZiAoYUVudHJ5ID4gYkVudHJ5KXsgcmV0dXJuICAxOyB9O1xuICAgIHJldHVybiAwO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWVndFRW50cnk7XG5tb2R1bGUuZXhwb3J0cy5Db21wYXJhdG9yID0gQ29tcGFyYXRvcjtcbiIsIid1c2Ugc3RyaWN0Jztcbm1vZHVsZS5leHBvcnRzID0gU29ydGVkQXJyYXlcbnZhciBzZWFyY2ggPSByZXF1aXJlKCdiaW5hcnktc2VhcmNoJylcblxuZnVuY3Rpb24gU29ydGVkQXJyYXkoY21wLCBhcnIpIHtcbiAgaWYgKHR5cGVvZiBjbXAgIT0gJ2Z1bmN0aW9uJylcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjb21wYXJhdG9yIG11c3QgYmUgYSBmdW5jdGlvbicpXG5cbiAgdGhpcy5hcnIgPSBhcnIgfHwgW11cbiAgdGhpcy5jbXAgPSBjbXBcbn1cblxuU29ydGVkQXJyYXkucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGluZGV4ID0gc2VhcmNoKHRoaXMuYXJyLCBlbGVtZW50LCB0aGlzLmNtcClcbiAgaWYgKGluZGV4IDwgMClcbiAgICBpbmRleCA9IH5pbmRleFxuXG4gIHRoaXMuYXJyLnNwbGljZShpbmRleCwgMCwgZWxlbWVudClcbn1cblxuU29ydGVkQXJyYXkucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHZhciBpbmRleCA9IHNlYXJjaCh0aGlzLmFyciwgZWxlbWVudCwgdGhpcy5jbXApXG4gIHJldHVybiBpbmRleCA+PSAwXG4gICAgPyBpbmRleFxuICAgIDogLTFcbn1cblxuU29ydGVkQXJyYXkucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgdmFyIGluZGV4ID0gc2VhcmNoKHRoaXMuYXJyLCBlbGVtZW50LCB0aGlzLmNtcClcbiAgaWYgKGluZGV4IDwgMClcbiAgICByZXR1cm4gZmFsc2VcblxuICB0aGlzLmFyci5zcGxpY2UoaW5kZXgsIDEpXG4gIHJldHVybiB0cnVlXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGhheXN0YWNrLCBuZWVkbGUsIGNvbXBhcmF0b3IsIGxvdywgaGlnaCkge1xuICB2YXIgbWlkLCBjbXA7XG5cbiAgaWYobG93ID09PSB1bmRlZmluZWQpXG4gICAgbG93ID0gMDtcblxuICBlbHNlIHtcbiAgICBsb3cgPSBsb3d8MDtcbiAgICBpZihsb3cgPCAwIHx8IGxvdyA+PSBoYXlzdGFjay5sZW5ndGgpXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcImludmFsaWQgbG93ZXIgYm91bmRcIik7XG4gIH1cblxuICBpZihoaWdoID09PSB1bmRlZmluZWQpXG4gICAgaGlnaCA9IGhheXN0YWNrLmxlbmd0aCAtIDE7XG5cbiAgZWxzZSB7XG4gICAgaGlnaCA9IGhpZ2h8MDtcbiAgICBpZihoaWdoIDwgbG93IHx8IGhpZ2ggPj0gaGF5c3RhY2subGVuZ3RoKVxuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJpbnZhbGlkIHVwcGVyIGJvdW5kXCIpO1xuICB9XG5cbiAgd2hpbGUobG93IDw9IGhpZ2gpIHtcbiAgICAvKiBOb3RlIHRoYXQgXCIobG93ICsgaGlnaCkgPj4+IDFcIiBtYXkgb3ZlcmZsb3csIGFuZCByZXN1bHRzIGluIGEgdHlwZWNhc3RcbiAgICAgKiB0byBkb3VibGUgKHdoaWNoIGdpdmVzIHRoZSB3cm9uZyByZXN1bHRzKS4gKi9cbiAgICBtaWQgPSBsb3cgKyAoaGlnaCAtIGxvdyA+PiAxKTtcbiAgICBjbXAgPSArY29tcGFyYXRvcihoYXlzdGFja1ttaWRdLCBuZWVkbGUpO1xuXG4gICAgLyogVG9vIGxvdy4gKi9cbiAgICBpZihjbXAgPCAwLjApIFxuICAgICAgbG93ICA9IG1pZCArIDE7XG5cbiAgICAvKiBUb28gaGlnaC4gKi9cbiAgICBlbHNlIGlmKGNtcCA+IDAuMClcbiAgICAgIGhpZ2ggPSBtaWQgLSAxO1xuICAgIFxuICAgIC8qIEtleSBmb3VuZC4gKi9cbiAgICBlbHNlXG4gICAgICByZXR1cm4gbWlkO1xuICB9XG5cbiAgLyogS2V5IG5vdCBmb3VuZC4gKi9cbiAgcmV0dXJuIH5sb3c7XG59XG4iLCJ2YXIgU29ydGVkQXJyYXkgPSByZXF1aXJlKCdzb3J0ZWQtY21wLWFycmF5Jyk7XG52YXIgQ29tcGFyYXRvciA9IHJlcXVpcmUoJy4vdnZ3ZWVudHJ5LmpzJykuQ29tcGFyYXRvcjtcbnZhciBWVndFRW50cnkgPSByZXF1aXJlKCcuL3Z2d2VlbnRyeS5qcycpO1xuXG4vKipcbiAqIFxcY2xhc3MgVlZ3RVxuICogXFxicmllZiBjbGFzcyB2ZXJzaW9uIHZlY3RvciB3aXRoIGV4Y2VwdGlvbiBrZWVwcyB0cmFjayBvZiBldmVudHMgaW4gYSBcbiAqIGNvbmNpc2Ugd2F5XG4gKiBcXHBhcmFtIGUgdGhlIGVudHJ5IGNob3NlbiBieSB0aGUgbG9jYWwgc2l0ZSAoMSBlbnRyeSA8LT4gMSBzaXRlKVxuICovXG5mdW5jdGlvbiBWVndFKGUpe1xuICAgIHRoaXMubG9jYWwgPSBuZXcgVlZ3RUVudHJ5KGUpO1xuICAgIHRoaXMudmVjdG9yID0gbmV3IFNvcnRlZEFycmF5KENvbXBhcmF0b3IpO1xuICAgIHRoaXMudmVjdG9yLmluc2VydCh0aGlzLmxvY2FsKTtcbn07XG5cbi8qIVxuICogXFxicmllZiBjbG9uZSBvZiB0aGlzIHZ2d2VcbiAqL1xuVlZ3RS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpe1xuICAgIHZhciBjbG9uZVZWd0UgPSBuZXcgVlZ3RSh0aGlzLmxvY2FsLmUpO1xuICAgIGZvciAodmFyIGk9MDsgaTx0aGlzLnZlY3Rvci5hcnIubGVuZ3RoOyArK2kpe1xuICAgICAgICBjbG9uZVZWd0UudmVjdG9yLmFycltpXSA9IG5ldyBWVndFRW50cnkodGhpcy52ZWN0b3IuYXJyW2ldLmUpO1xuICAgICAgICBjbG9uZVZWd0UudmVjdG9yLmFycltpXS52ID0gdGhpcy52ZWN0b3IuYXJyW2ldLnY7XG4gICAgICAgIGZvciAodmFyIGo9MDsgajx0aGlzLnZlY3Rvci5hcnJbaV0ueC5sZW5ndGg7ICsrail7XG4gICAgICAgICAgICBjbG9uZVZWd0UudmVjdG9yLmFycltpXS54LnB1c2godGhpcy52ZWN0b3IuYXJyW2ldLnhbal0pO1xuICAgICAgICB9O1xuICAgICAgICBpZiAoY2xvbmVWVndFLnZlY3Rvci5hcnJbaV0uZSA9PT0gdGhpcy5sb2NhbC5lKXtcbiAgICAgICAgICAgIGNsb25lVlZ3RS5sb2NhbCA9IGNsb25lVlZ3RS52ZWN0b3IuYXJyW2ldO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIGNsb25lVlZ3RTtcbn07XG5cblZWd0UucHJvdG90eXBlLmZyb21KU09OID0gZnVuY3Rpb24ob2JqZWN0KXtcbiAgICBmb3IgKHZhciBpPTA7IGk8b2JqZWN0LnZlY3Rvci5hcnIubGVuZ3RoOyArK2kpe1xuICAgICAgICB0aGlzLnZlY3Rvci5hcnJbaV0gPSBuZXcgVlZ3RUVudHJ5KG9iamVjdC52ZWN0b3IuYXJyW2ldLmUpO1xuICAgICAgICB0aGlzLnZlY3Rvci5hcnJbaV0udiA9IG9iamVjdC52ZWN0b3IuYXJyW2ldLnY7XG4gICAgICAgIGZvciAodmFyIGo9MDsgajxvYmplY3QudmVjdG9yLmFycltpXS54Lmxlbmd0aDsgKytqKXtcbiAgICAgICAgICAgIHRoaXMudmVjdG9yLmFycltpXS54LnB1c2gob2JqZWN0LnZlY3Rvci5hcnJbaV0ueFtqXSk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChvYmplY3QudmVjdG9yLmFycltpXS5lID09PSBvYmplY3QubG9jYWwuZSl7XG4gICAgICAgICAgICB0aGlzLmxvY2FsID0gdGhpcy52ZWN0b3IuYXJyW2ldO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFxcYnJpZWYgaW5jcmVtZW50IHRoZSBlbnRyeSBvZiB0aGUgdmVjdG9yIG9uIGxvY2FsIHVwZGF0ZVxuICogXFxyZXR1cm4ge19lOiBlbnRyeSwgX2M6IGNvdW50ZXJ9IHVuaXF1ZWx5IGlkZW50aWZ5aW5nIHRoZSBvcGVyYXRpb25cbiAqL1xuVlZ3RS5wcm90b3R5cGUuaW5jcmVtZW50ID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmxvY2FsLmluY3JlbWVudCgpO1xuICAgIHJldHVybiB7X2U6IHRoaXMubG9jYWwuZSwgX2M6dGhpcy5sb2NhbC52fTsgXG59O1xuXG5cbi8qKlxuICogXFxicmllZiBpbmNyZW1lbnQgZnJvbSBhIHJlbW90ZSBvcGVyYXRpb25cbiAqIFxccGFyYW0gZWMgdGhlIGVudHJ5IGFuZCBjbG9jayBvZiB0aGUgcmVjZWl2ZWQgZXZlbnQgdG8gYWRkIHN1cHBvc2VkbHkgcmR5XG4gKiB0aGUgdHlwZSBpcyB7X2U6IGVudHJ5LCBfYzogY291bnRlcn1cbiAqL1xuVlZ3RS5wcm90b3R5cGUuaW5jcmVtZW50RnJvbSA9IGZ1bmN0aW9uIChlYyl7XG4gICAgLy8gIzAgZmluZCB0aGUgZW50cnkgd2l0aGluIHRoZSBhcnJheSBvZiBWVndFbnRyaWVzXG4gICAgdmFyIGluZGV4ID0gdGhpcy52ZWN0b3IuaW5kZXhPZihlYy5fZSk7XG4gICAgaWYgKGluZGV4IDwgMCl7XG4gICAgICAgIC8vICMxIGlmIHRoZSBlbnRyeSBkb2VzIG5vdCBleGlzdCwgaW5pdGlhbGl6ZSBhbmQgaW5jcmVtZW50XG4gICAgICAgIHRoaXMudmVjdG9yLmluc2VydChuZXcgVlZ3RUVudHJ5KGVjLl9lKSk7XG4gICAgICAgIHRoaXMudmVjdG9yLmFyclt0aGlzLnZlY3Rvci5pbmRleE9mKGVjLl9lKV0uaW5jcmVtZW50RnJvbShlYy5fYyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gIzIgb3RoZXJ3aXNlLCBvbmx5IGluY3JlbWVudFxuICAgICAgICB0aGlzLnZlY3Rvci5hcnJbaW5kZXhdLmluY3JlbWVudEZyb20oZWMuX2MpO1xuICAgIH07XG59O1xuXG5cbi8qKlxuICogXFxicmllZiBjaGVjayBpZiB0aGUgYXJndW1lbnQgYXJlIGNhdXNhbGx5IHJlYWR5IHJlZ2FyZHMgdG8gdGhpcyB2ZWN0b3JcbiAqIFxccGFyYW0gZWMgdGhlIHNpdGUgY2xvY2sgdGhhdCBoYXBwZW4tYmVmb3JlIHRoZSBjdXJyZW50IGV2ZW50XG4gKi9cblZWd0UucHJvdG90eXBlLmlzUmVhZHkgPSBmdW5jdGlvbihlYyl7XG4gICAgdmFyIHJlYWR5ID0gIWVjO1xuICAgIGlmICghcmVhZHkpe1xuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLnZlY3Rvci5pbmRleE9mKGVjLl9lKTtcbiAgICAgICAgcmVhZHkgPSBpbmRleCA+PTAgJiYgZWMuX2MgPD0gdGhpcy52ZWN0b3IuYXJyW2luZGV4XS52ICYmXG4gICAgICAgICAgICB0aGlzLnZlY3Rvci5hcnJbaW5kZXhdLnguaW5kZXhPZihlYy5fYyk8MDtcbiAgICB9O1xuICAgIHJldHVybiByZWFkeTtcbn07XG5cbi8qKlxuICogXFxicmllZiBjaGVjayBpZiB0aGUgbWVzc2FnZSBjb250YWlucyBpbmZvcm1hdGlvbiBhbHJlYWR5IGRlbGl2ZXJlZFxuICogXFxwYXJhbSBlYyB0aGUgc2l0ZSBjbG9jayB0byBjaGVja1xuICovXG5WVndFLnByb3RvdHlwZS5pc0xvd2VyID0gZnVuY3Rpb24oZWMpe1xuICAgIHJldHVybiAoZWMgJiYgdGhpcy5pc1JlYWR5KGVjKSk7XG59O1xuXG4vKipcbiAqIFxcYnJpZWYgbWVyZ2UgdGhlIHZlcnNpb24gdmVjdG9yIGluIGFyZ3VtZW50IHdpdGggdGhpc1xuICogXFxwYXJhbSBvdGhlciB0aGUgb3RoZXIgdmVyc2lvbiB2ZWN0b3IgdG8gbWVyZ2VcbiAqL1xuVlZ3RS5wcm90b3R5cGUubWVyZ2UgPSBmdW5jdGlvbihvdGhlcil7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvdGhlci52ZWN0b3IuYXJyLmxlbmd0aDsgKytpKXtcbiAgICAgICAgdmFyIGVudHJ5ID0gb3RoZXIudmVjdG9yLmFycltpXTtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy52ZWN0b3IuaW5kZXhPZihlbnRyeSk7XG4gICAgICAgIGlmIChpbmRleCA8IDApe1xuICAgICAgICAgICAgLy8gIzEgZW50cnkgZG9lcyBub3QgZXhpc3QsIGZ1bGx5IGNvcHkgaXRcbiAgICAgICAgICAgIHZhciBuZXdFbnRyeSA9IG5ldyBWVndFRW50cnkoZW50cnkuZSk7XG4gICAgICAgICAgICBuZXdFbnRyeS52ID0gZW50cnkudjtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZW50cnkueC5sZW5ndGg7ICsrail7XG4gICAgICAgICAgICAgICAgbmV3RW50cnkueC5wdXNoKGVudHJ5Lnhbal0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMudmVjdG9yLmluc2VydChuZXdFbnRyeSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgLy8gIzIgb3RoZXJ3aXNlIG1lcmdlIHRoZSBlbnRyaWVzXG4gICAgICAgICAgICB2YXIgY3VyckVudHJ5ID0gdGhpcy52ZWN0b3IuYXJyW2ldO1xuICAgICAgICAgICAgLy8gIzJBIHJlbW92ZSB0aGUgZXhjZXB0aW9uIGZyb20gb3VyIHZlY3RvclxuICAgICAgICAgICAgdmFyIGogPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGo8Y3VyckVudHJ5LngubGVuZ3RoKXtcbiAgICAgICAgICAgICAgICBpZiAoY3VyckVudHJ5Lnhbal08ZW50cnkudiAmJlxuICAgICAgICAgICAgICAgICAgICBlbnRyeS54LmluZGV4T2YoY3VyckVudHJ5Lnhbal0pPDApe1xuICAgICAgICAgICAgICAgICAgICBjdXJyRW50cnkueC5zcGxpY2UoaiwgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgKytqO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gIzJCIGFkZCB0aGUgbmV3IGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIGogPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGo8ZW50cnkueC5sZW5ndGgpe1xuICAgICAgICAgICAgICAgIGlmIChlbnRyeS54W2pdID4gY3VyckVudHJ5LnYgJiZcbiAgICAgICAgICAgICAgICAgICAgY3VyckVudHJ5LnguaW5kZXhPZihlbnRyeS54W2pdKTwwKXtcbiAgICAgICAgICAgICAgICAgICAgY3VyckVudHJ5LngucHVzaChlbnRyeS54W2pdKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICsrajtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjdXJyRW50cnkudiA9IE1hdGgubWF4KGN1cnJFbnRyeS52LCBlbnRyeS52KTtcbiAgICAgICAgfTtcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWVndFO1xuXG4iXX0=
