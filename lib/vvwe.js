'use strict';

const VVwEEntry = require('./vvweentry.js');
const Pair = require('./pair.js');

/**
 * Version vector with exceptions.
 */
class VVwE {
    /**
     * @param {Object} e The entry chosen by the local site. One entry per site.
     */
    constructor(e) {
        this.local = new VVwEEntry(e);
        this.vector = new Map();
        this.vector.set(e, this.local);
    };

    // (TODO) fromJSON
    // (TODO) clone
    // (TODO) merge
    
    /**
     * Increment the entry of the vector on local update.
     * @return {Pair} A pair that uniquely identifies the operation.
     */
    increment () {
        this.local.increment();
        return new Pair(this.local.e, this.local.v); 
    };


    /**
     * Increment from a remote operation.
     * @param {Pair} ec The entry and clock of the received event to add
     * supposedly ready.
     */
    incrementFrom (ec) {
        if (!this.vector.has(ec.e)) {
            this.vector.set(ec.e, new VVwEEntry(ec.e));
        };
        this.vector.get(ec.e).incrementFrom(ec.c);
    };
    

    /**
     * Check if the argument are causally ready regards to this vector.  
     * @param {Pair} ec The identifier, i.e., the site clock of the operation
     * that happened-before the current event.
     * @return {Boolean} true if the event is ready, i.e. the identifier has
     * already been integrated to this vector; false otherwise.
     */
    isReady (ec) {
        // #0 no ec, automatically ready
        if (typeof ec === 'undefined' || ec === null) { return true; };
        // #1 otherwise, check in the vector and exceptions
        return this.vector.has(ec.e) && this.vector.get(ec.e).contains(ec.c);
    };

    /**
     * Check if the message contains information already delivered.
     * @param {Pair} ec the site clock to check.
     */
    isLower (ec) {
        return typeof ec !== 'undefined' && ec !== null && this.isReady(ec);
    };
    
};

module.exports = VVwE;

