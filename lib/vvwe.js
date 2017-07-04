'use strict';

const SortedArray = require('sorted-cmp-array');
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
        this.vector = new SortedArray(VVwEEntry.comparator);
        this.vector.insert(this.local);
    };

    /**
     * Clone of this vvwe.
     * @return {VVwE} A version vector with exceptions containing the same
     * entry; clock; exceptions triples.
     */
    clone () {
        const cloneVVwE = new VVwE(this.local.e);
        for (let i = 0; i < this.vector.arr.length; ++i) {
            cloneVVwE.vector.arr[i] = new VVwEEntry(this.vector.arr[i].e);
            cloneVVwE.vector.arr[i].v = this.vector.arr[i].v;
            for (let j = 0; j < this.vector.arr[i].x.length; ++j) {
                cloneVVwE.vector.arr[i].x.push(this.vector.arr[i].x[j]);
            };
            if (cloneVVwE.vector.arr[i].e === this.local.e) {
                cloneVVwE.local = cloneVVwE.vector.arr[i];
            };
        };
        return cloneVVwE;
    };

    /**
     * Get a version vector with exceptions using a JSON.
     * @return {VVwE} The version vector with exceptions extracted from the
     * JSON in argument.
     */
    static fromJSON (object) {
        const vvwe = new VVwE(object.local.e);
        for (let i = 0; i < object.vector.arr.length; ++i) {
            vvwe.vector.arr[i] = new VVwEEntry(object.vector.arr[i].e);
            vvwe.vector.arr[i].v = object.vector.arr[i].v;
            for (let j = 0; j < object.vector.arr[i].x.length; ++j) {
                vvwe.vector.arr[i].x.push(object.vector.arr[i].x[j]);
            };
            if (object.vector.arr[i].e === object.local.e) {
                vvwe.local = vvwe.vector.arr[i];
            };
        };
        return vvwe;
    };
    
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
        // #0 find the entry within the array of VVwEntries
        const index = this.vector.indexOf(ec.e);
        if (index < 0) {
            // #1 if the entry does not exist, initialize and increment
            this.vector.insert(new VVwEEntry(ec.e));
            this.vector.arr[this.vector.indexOf(ec.e)].incrementFrom(ec.c);
        } else {
            // #2 otherwise, only increment
            this.vector.arr[index].incrementFrom(ec.c);
        };
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
        const index = this.vector.indexOf(ec.e);
        return index >= 0 && ec.c <= this.vector.arr[index].v &&
            this.vector.arr[index].x.indexOf(ec.c) < 0;
    };

    /**
     * Check if the message contains information already delivered.
     * @param {Pair} ec the site clock to check.
     */
    isLower (ec) {
        return typeof ec !== 'undefined' && ec !== null && this.isReady(ec);
    };
    
    /**
     * Merges the version vector in argument with this.
     * @param {VVwE} other the other version vector to merge with.
     */
    merge (other) {
        for (let i = 0; i < other.vector.arr.length; ++i) {
            let entry = other.vector.arr[i];
            let index = this.vector.indexOf(entry);
            if (index < 0) {
                // #1 entry does not exist, fully copy it
                let newEntry = new VVwEEntry(entry.e);
                newEntry.v = entry.v;
                for (let j = 0; j < entry.x.length; ++j){
                    newEntry.x.push(entry.x[j]);
                };
                this.vector.insert(newEntry);
            } else {
                // #2 otherwise merge the entries
                let currEntry = this.vector.arr[index];
                // #2A remove the exception from our vector
                let j = 0;
                while (j < currEntry.x.length) {
                    if (currEntry.x[j]<entry.v &&
                        entry.x.indexOf(currEntry.x[j]) < 0) {
                        currEntry.x.splice(j, 1);
                    } else {
                        ++j;
                    };
                };
                // #2B add the new exceptions
                j = 0;
                while (j < entry.x.length) {
                    if (entry.x[j] > currEntry.v &&
                        currEntry.x.indexOf(entry.x[j]) < 0) {
                        currEntry.x.push(entry.x[j]);
                    };
                    ++j;
                };
                currEntry.v = Math.max(currEntry.v, entry.v);
            };
        };
    };
    
};

module.exports = VVwE;

