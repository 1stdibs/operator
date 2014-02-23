/**
 * User: daletan
 * Date: 8/22/13
 * Time: 5:46 PM
 * Copyright 1stdibs.com, Inc. 2013. All Rights Reserved.
 */


describe('shim tests for operator pub/sub on steroids', function() {
    var obj,
        Klass = function () {};
    Klass.fn = Klass.prototype;
    Klass.fn.staticMethod = function (arg) {
        console.log('staticmethod: ', arg);
        return arg;
    };
    Klass.fn.staticMethod2 = function (arg) {
        return "second method: " + arg;
    };
    Klass.fn.staticMethod3 = function (arg) {
        return "third method: " + arg;
    };

    beforeEach(function () {
        obj = new Klass;
        spyOn(obj, 'staticMethod');
    });

    it("should not call function that is not subscribed", function() {
        $.publish('test:pubsub');
        expect(obj.staticMethod).not.toHaveBeenCalled();
    });
    it("should not call function that is subscribed after event is published", function() {
        $.publish('test:pubsub');
        $.subscribe('test:pubsub', obj.staticMethod);
        expect(obj.staticMethod).not.toHaveBeenCalled();
    });
    it("should call subscribed function", function() {
        $.subscribe('test:pubsub', obj.staticMethod);
        $.publish('test:pubsub');
        expect(obj.staticMethod).toHaveBeenCalled();
    });

    it("should subscribe a method and unsubscribe the same method", function () {
        // this test is currently failing
        var count = 0;
        function tester() {
            count++;
        }
        $.subscribe('test:pubsub', tester);
        $.publish('test:pubsub');
        expect(count).toBe(1);
        $.unsubscribe('test:pubsub', tester);
        $.publish('test:pubsub');
        expect(count).toBe(1);
    });

    it("should fire based on any event that was `ever` published", function () {
        var count = 0;
        function tester() {
            count++;
        }
        $.publish('test:pubsub');
        $.ever('test:pubsub', tester);
        expect(count).toBe(1);
        $.publish('test:pubsub');
        expect(count).toBe(2);
    });

    it('should fire `onceEver` (order of publishing and subscribing does not matter)', function () {
        var count = 0;
        function tester() {
            count++;
        }
        $.publish('test:pubsub');
        expect(count).toBe(0);
        $.onceEver('test:pubsub', tester);
        expect(count).toBe(1);
        $.publish('test:pubsub');
        expect(count).toBe(1);
    });

    it("should only fire an event `once` (mapped to jQuery.one, order of publishing and subscribing matters)", function () {
        var count = 0;
        function tester() {
            count++;
        }
        $.once('test:pubsub-fired', tester);
        $.publish('test:pubsub-fired');
        expect(count).toBe(1);
        $.publish('test:pubsub-fired')
        expect(count).toBe(1);
    });

    it("`subWhen`: should subscribe to multiple events and only fire when all events have fired", function () {
        spyOn(obj, 'staticMethod2');
        spyOn(obj, 'staticMethod3');
        $.subWhen('foo', 'bar').then(obj.staticMethod3);
        $.subscribe('foo', obj.staticMethod);
        $.subscribe('bar', obj.staticMethod2);
        $.publish('foo');
        $.publish('bar');
        expect(obj.staticMethod).toHaveBeenCalled();
        expect(obj.staticMethod2).toHaveBeenCalled();
        expect(obj.staticMethod3).toHaveBeenCalled();
    });

    it("should bind multiple events from one call", function () {
        var count = 0;
        $.subscribe("test:pubsub test:pubsub2", function () {
            count++;
        });
        $.publish("test:pubsub");
        expect(count).toBe(1);
        $.publish("test:pubsub2");
        expect(count).toBe(2);
    });

    it("should apply arguments dynamically", function () {
        var ret = 0;
        function applier() {
            $.publish.apply($, arguments);
        }
        function subscriber(e, count) {
            ret = count;
        }
        $.subscribe('apply-test:event', subscriber);
        applier('apply-test:event', 100);
        expect(ret).toBe(100);
    });

    xit("should work in noConflict mode", function () {

    });

});