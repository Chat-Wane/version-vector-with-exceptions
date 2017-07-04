'use strict';

/**
 * Pair that encapsulates the result of an increment in the array.
 */
class Pair {
    /**
     * @param {Object} entry The entry incremented.
     * @param {Number} counter The counter associated to that entry.
     */
    constructor (entry, counter) {
        this.e = entry;
        this.c = counter;
    };
    
};

module.exports = Pair;
