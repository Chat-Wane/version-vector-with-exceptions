'use strict';

const expect = require('expect.js');
const Mocha = require('mocha');

const VVwE = require('../lib/vvwe.js');
const Pair = require('../lib/pair.js');

describe('vvwe.js', function() {

    describe('vvwe', function() {
        it('init the entries to zero', function() {
            const vvwe = new VVwE(42);
            expect(vvwe.local.e).to.be.eql(42);
            expect(vvwe.local.v).to.be.eql(0);
            expect(vvwe.local.x).to.have.length(0);
        });
    });
    
    describe('increment', function() {
        it('increment the entry', function() {
            const vvwe = new VVwE(42);
            vvwe.increment();
            expect(vvwe.local.v).to.be.eql(1);
        });
        
        it('no exception created', function() {
            const vvwe = new VVwE(42);
            vvwe.increment();
            vvwe.increment();
            expect(vvwe.local.x).to.have.length(0);
        });
    });

    describe('incrementfrom', function() {
        it('increment the entry from another vv', function() {
            const vvwe = new VVwE(13);
            const rvvwe = new VVwE(42);
            const ec = rvvwe.increment();
            vvwe.incrementFrom(ec);
            expect(rvvwe.vector.arr[0].v).to.be.eql(1);
            expect(vvwe.vector.arr[1].v).to.be.eql(rvvwe.local.v);
        });

        it('increment from anywhere does not affect my entry', function() {
            const vvwe = new VVwE(13);
            const rvvwe = new VVwE(42);
            const ec = rvvwe.increment();
            vvwe.incrementFrom(ec);
            expect(vvwe.local.v).to.be.eql(0);
        });

        it('a message is lost, exception is made', function() {
            const vvwe = new VVwE(13);
            const rvvwe = new VVwE(42);
            rvvwe.increment();
            const ec = rvvwe.increment();
            expect(rvvwe.local.v).to.be.eql(2);
            vvwe.incrementFrom(ec);
            expect(vvwe.vector.arr[1].x).to.have.length(1);
            expect(vvwe.vector.arr[1].x.indexOf(1)).to.be.above(-1);
        });
    });
    
    describe('isReady', function() {
        it('check if an operation depending on another is ready', function() {
            const vvwe = new VVwE(42);
            const target = vvwe.increment();
            expect(vvwe.isReady(target)).to.be.ok();
            const target2 = new Pair(target.e, target.c+1);
            expect(vvwe.isReady(target2)).to.not.be.ok();
        });
        
        it('check if an operation independant of any other is rdy', function() {
            const vvwe = new VVwE(42);
            const c = null;
            expect(vvwe.isReady(c)).to.be.ok();
        });

        it('check in the omen vector for target operation', function() {
            const vvwe = new VVwE(42);
            const vvwe2 = new VVwE(13);
            vvwe2.increment();
            const ec = vvwe2.increment();
            vvwe.incrementFrom(ec);
            // another operation arrive depending on operation identifier by c;
            expect(vvwe.isReady(ec)).to.be.ok();
        });
    });
    
    describe('isLower', function(){
        it('check if the ev has been seen before or not', function() {
            const vvwe = new VVwE(42);
            const vvwe2 = new VVwE(13);
            const ec = vvwe2.increment();
            expect(vvwe.isLower(ec)).to.not.be.ok();
            vvwe.incrementFrom(ec);
            expect(vvwe.isLower(ec)).to.be.ok();
        });

        it('check in the omen if the ev has been seen', function() {
            const vvwe = new VVwE(42);
            const vvwe2 = new VVwE(13);
            vvwe2.increment();
            const ec = vvwe2.increment();
            expect(vvwe.isLower(ec)).to.not.be.ok();
            vvwe.incrementFrom(ec);
            expect(vvwe.isLower(ec)).to.be.ok();
        });
    });

    describe('clone', function() {
        it('produce two identical independant copies of the vvwe', function() {
            const vvwe = new VVwE(42);
            const vvwe2 = new VVwE(13);
            vvwe.increment();
            vvwe.incrementFrom(vvwe2.increment());
            const vvwe3 = vvwe.clone();
            vvwe3.increment();
            vvwe3.incrementFrom(vvwe2.increment());
            expect(vvwe3.local.e).to.be.eql(vvwe.local.e);
            expect(vvwe3.local.v).to.be.eql(vvwe.local.v+1);
            expect(vvwe3.vector.arr.length).to.be.eql(vvwe.vector.arr.length);
            expect(vvwe3.vector.arr[0].v).to.be.eql(vvwe.vector.arr[0].v+1);
        });
    });

    describe('merge', function() {
        it('merge two structures', function() {
            const vvwe = new VVwE(42);
            const vvwe2 = new VVwE(13);
            vvwe2.increment();
            vvwe2.increment();
            vvwe.merge(vvwe2);
            expect(vvwe.vector.arr[0].v).to.be.eql(2);
            vvwe2.increment();
            expect(vvwe.vector.arr[0].v).to.be.eql(2);
        });

        it('merge two structure taking care of exception of initiator',
           function() {
               const vvwe = new VVwE(42);
               const vvwe2 = new VVwE(13);
               vvwe2.increment();
               vvwe.incrementFrom(vvwe2.increment());
               expect(vvwe.vector.arr[0].x.length).to.be.eql(1);
               vvwe.merge(vvwe2);
               expect(vvwe.vector.arr[0].x.length).to.be.eql(0);
           });

        it('keeps the exception of the vvwe in argument', function() {
            const vvwe = new VVwE(42);
            const vvwe2 = new VVwE(13);
            const vvwe3 = new VVwE(37);
            vvwe2.increment();
            vvwe.incrementFrom(vvwe2.increment()); // 42 -> x 1
            vvwe3.incrementFrom(vvwe2.increment()); // 37 -> x 1 2
            vvwe.merge(vvwe3);
            expect(vvwe.vector.arr[0].x.length).to.be.eql(1);
            expect(vvwe3.vector.arr[0].x.length).to.be.eql(2);
            vvwe3.merge(vvwe);
            expect(vvwe3.vector.arr[0].x.length).to.be.eql(1);
            vvwe3.merge(vvwe2);
            expect(vvwe3.vector.arr[0].x.length).to.be.eql(0);
        });
        
        it('get new exceptions if the vvwe in arg is more uptodate',
           function() {
               const vvwe = new VVwE(42);
               const vvwe2 = new VVwE(13);
               const vvwe3 = new VVwE(37);
               vvwe3.incrementFrom(vvwe2.increment());
               vvwe3.incrementFrom(vvwe2.increment());
               vvwe.merge(vvwe2);
               expect(vvwe.vector.arr[0].v).to.be.eql(2);
               vvwe3.incrementFrom(vvwe2.increment());
               vvwe2.increment();
               vvwe2.increment();
               vvwe3.incrementFrom(vvwe2.increment());
               vvwe.merge(vvwe3);
               expect(vvwe.vector.arr[0].v).to.be.eql(6);
               expect(vvwe.vector.arr[0].x.length).to.be.eql(2);
           });
        
        it('test a bug example from the CRATE project', function() {
            const vvwe = new VVwE("6e3bedf4-45f9-4e05-ba55-7c4f99b28c44");
            const vvwe2 = new VVwE("f065d3ab-b5b5-4376-9bd5-25ee5db22313");
            for (let i = 0; i < 100; ++i) {
                vvwe.incrementFrom(vvwe2.increment());
            };
            vvwe.merge(vvwe2);
            expect(vvwe.local.v).to.be.eql(0);
        });
        
        it('test another bug example from the CRATE project', function() {
            const vvwe = new VVwE("72f8de1f-ade1-4e89-b5f4-1447902db2de");
            const vvwe2 = new VVwE("b0d3e97a-4aee-489a-987f-fb74b9fd929d");
            for (let i = 0; i < 8; ++i) {
                vvwe.incrementFrom(vvwe2.increment());
            };
            vvwe.merge(vvwe2);
            expect(vvwe.local.v).to.be.eql(0);
        });
        
    });
});
