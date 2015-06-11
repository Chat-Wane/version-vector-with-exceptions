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
	    expect(rvvwe.vector[0].v).to.be.eql(1);
	    expect(vvwe.vector[1].v).to.be.eql(rvvwe.local.v);
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
	    expect(vvwe.vector[1].x).to.have.length(1);
	    expect(vvwe.vector[1].x.indexOf(1)).to.be.above(-1);
	});
    });
    
    describe('isReady', function(){
	it('check if an operation depending on another is ready', function(){
	    var vvwe = new VVwE(42);
	    vvwe.increment();
	    var target = {_e:vvwe.local.e, _c:vvwe.local.v};
	    expect(vvwe.isRdy(target)).to.be.ok();
	    var target2 = {_e:vvwe.local.e, _c:(vvwe.local.v+1)};
	    expect(vvwe.isRdy(target2)).to.not.be.ok();
	});
	
	it('check if an operation independant of any other is rdy',function(){
	    var vvwe = new VVwE(42);
	    var c = null;
	    expect(vvwe.isRdy(c)).to.be.ok();
	});

	it('check in the omen vector for target operation', function(){
	    var vvwe = new VVwE(42);
	    var vvwe2 = new VVwE(13);
	    vvwe2.increment();
	    vvwe2.increment();
	    var c = {_e: vvwe2.local.e, _c: vvwe2.local.v};
	    vvwe.incrementFrom(c);
	    // another operation arrive depending on operation identifier by c;
	    expect(vvwe.isRdy(c)).to.be.ok();
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
    
});
