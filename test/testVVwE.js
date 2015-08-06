var expect = require('expect.js');
var Mocha = require('mocha');

var VVwE = require('../lib/vvwe.js');

describe('vvwe.js', function() {

    describe('vvwe', function(){
        it('init the entries to zero', function(){
            var vvwe = new VVwE(42)
            expect(vvwe.local.e).to.be.eql(42);
            expect(vvwe.local.v).to.be.eql(0);
            expect(vvwe.local.x).to.have.length(0);
        });
    });
    
    describe('increment', function(){
        it('increment the entry', function(){
            var vvwe = new VVwE(42);
            vvwe.increment();
            expect(vvwe.local.v).to.be.eql(1);
        });
        
        it('no exception created', function(){
            var vvwe = new VVwE(42);
            vvwe.increment();
            vvwe.increment();
            expect(vvwe.local.x).to.have.length(0);
        });
    });

    describe('incrementfrom', function(){
        it('increment the entry from another vv', function(){
            var vvwe = new VVwE(13);
            var rvvwe = new VVwE(42);
            rvvwe.increment();
            vvwe.incrementFrom({_e: rvvwe.local.e, _c:rvvwe.local.v });
            expect(rvvwe.vector.arr[0].v).to.be.eql(1);
            expect(vvwe.vector.arr[1].v).to.be.eql(rvvwe.local.v);
        });

        it('increment from anywhere does not affect my entry', function(){
            var vvwe = new VVwE(13);
            var rvvwe = new VVwE(42);
            rvvwe.increment();
            vvwe.incrementFrom({_e: rvvwe.local.e, _c:rvvwe.local.v });
            expect(vvwe.local.v).to.be.eql(0);
        });

        it('a message is lost, exception is made', function(){
            var vvwe = new VVwE(13);
            var rvvwe = new VVwE(42);
            rvvwe.increment();
            rvvwe.increment();
            expect(rvvwe.local.v).to.be.eql(2);
            vvwe.incrementFrom({_e: rvvwe.local.e, _c:rvvwe.local.v });
            expect(vvwe.vector.arr[1].x).to.have.length(1);
            expect(vvwe.vector.arr[1].x.indexOf(1)).to.be.above(-1);
        });
    });
    
    describe('isReady', function(){
        it('check if an operation depending on another is ready', function(){
            var vvwe = new VVwE(42);
            vvwe.increment();
            var target = {_e:vvwe.local.e, _c:vvwe.local.v};
            expect(vvwe.isReady(target)).to.be.ok();
            var target2 = {_e:vvwe.local.e, _c:(vvwe.local.v+1)};
            expect(vvwe.isReady(target2)).to.not.be.ok();
        });
        
        it('check if an operation independant of any other is rdy',function(){
            var vvwe = new VVwE(42);
            var c = null;
            expect(vvwe.isReady(c)).to.be.ok();
        });

        it('check in the omen vector for target operation', function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            vvwe2.increment();
            vvwe2.increment();
            var c = {_e: vvwe2.local.e, _c: vvwe2.local.v};
            vvwe.incrementFrom(c);
            // another operation arrive depending on operation identifier by c;
            expect(vvwe.isReady(c)).to.be.ok();
        });
    });
    
    describe('isLower', function(){
        it('check if the ev has been seen before or not', function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            vvwe2.increment();
            var c = {_e : vvwe2.local.e , _c:vvwe2.local.v};
            expect(vvwe.isLower(c)).to.not.be.ok();
            vvwe.incrementFrom(c);
            expect(vvwe.isLower(c)).to.be.ok();
        });

        it('check in the omen if the ev has been seen', function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            vvwe2.increment();
            vvwe2.increment();
            var c = {_e : vvwe2.local.e , _c:vvwe2.local.v};
            expect(vvwe.isLower(c)).to.not.be.ok();
            vvwe.incrementFrom(c);
            expect(vvwe.isLower(c)).to.be.ok();
        });
    });

    describe('clone', function(){
        it('produce two identical independant copies of the vvwe', function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            vvwe.increment();
            vvwe.incrementFrom(vvwe2.increment());
            var vvwe3 = vvwe.clone();
            vvwe3.increment();
            vvwe3.incrementFrom(vvwe2.increment());
            expect(vvwe3.local.e).to.be.eql(vvwe.local.e);
            expect(vvwe3.local.v).to.be.eql(vvwe.local.v+1);
            expect(vvwe3.vector.arr.length).to.be.eql(vvwe.vector.arr.length);
            expect(vvwe3.vector.arr[0].v).to.be.eql(vvwe.vector.arr[0].v+1);
        });
    });

    describe('merge', function(){
        it('merge two structures', function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            vvwe2.increment();
            vvwe2.increment();
            vvwe.merge(vvwe2);
            expect(vvwe.vector.arr[0].v).to.be.eql(2);
            vvwe2.increment();
            expect(vvwe.vector.arr[0].v).to.be.eql(2);
        });

        it('merge two structure taking care of exception of initiator', function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            vvwe2.increment();
            vvwe.incrementFrom(vvwe2.increment());
            expect(vvwe.vector.arr[0].x.length).to.be.eql(1);
            vvwe.merge(vvwe2);
            expect(vvwe.vector.arr[0].x.length).to.be.eql(0);
        });

        it('keeps the exception of the vvwe in argument', function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            var vvwe3 = new VVwE(37);
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

        it('get new exceptions if the vvwe in arg is more uptodate',function(){
            var vvwe = new VVwE(42);
            var vvwe2 = new VVwE(13);
            var vvwe3 = new VVwE(37);
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

        it('test a bug example from the CRATE project', function(){
            var vvwe = new VVwE("6e3bedf4-45f9-4e05-ba55-7c4f99b28c44");
            var vvwe2 = new VVwE("f065d3ab-b5b5-4376-9bd5-25ee5db22313");
            for (var i = 0; i < 100; ++i) {
                vvwe.incrementFrom(vvwe2.increment());
            };
            vvwe.merge(vvwe2);
            expect(vvwe.local.v).to.be.eql(0);
        });
    });
});
