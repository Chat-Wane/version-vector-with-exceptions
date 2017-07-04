'use strict';

/**
 *  Create an entry of the version vector with exceptions containing the index
 *  of the entry, the value v that creates a contiguous interval from 0 to v,
 *  an array of integers that contains the operations lower to v that have not
 *  been received yet.
 */
class VVwEEntry {
    /**
     * @param {Object} e The entry in the interval version vector.
     */
    constructor (e) {
        this.e = e;   
        this.v = 0;
        this.x = [];
    };

    /**
     * Increment the local counter.
     */
    increment () {
        this.v += 1;
    };

    /**
     * Increment from a remote operation.
     * @param {Number} c the counter of the operation to add to this.
     */
    incrementFrom (c) {
        // #1 check if the counter is included in the exceptions
        if (c < this.v){
            const index = this.x.indexOf(c);
            if (index >= 0) { // the exception is found
                this.x.splice(index, 1);
            };
        };
        // #2 if the value is +1 compared to the current value of the vector
        if (c === (this.v + 1)) {
            this.v += 1;
        };
        // #3 otherwise exceptions are made
        if (c > (this.v + 1)) {
            for (let i = (this.v + 1); i < c; ++i){
                this.x.push(i);
            };
            this.v = c;
        };
    };

    /**
     * Comparison function between two VVwE entries.
     * @param {VVwEEntry} a The first element.
     * @param {VVwEEntry} b The second element.
     * @return -1 if a < b, 1 if a > b, 0 otherwise
     */
    static comparator (a, b) {
        const aEntry = (a.e) || a;
        const bEntry = (b.e) || b;
        if (aEntry < bEntry) { return -1; };
        if (aEntry > bEntry){ return  1; };
        return 0;
    };

};

module.exports = VVwEEntry;
