/**
 * User: daletan
 * Date: 8/22/13
 * Time: 5:46 PM
 * Copyright 1stdibs.com, Inc. 2013. All Rights Reserved.
 */


describe('operator pub/sub on steroids', function() {
    var obj,
        Klass = function () {};
    Klass.fn = Klass.prototype;
    Klass.fn.staticMethod = function (arg) {
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
    });

    it("should not call function that is not subscribed", function() {
        spyOn(obj, 'staticMethod');
        $.operator.publish('test:pubsub');
        expect(obj.staticMethod).not.toHaveBeenCalled();
    });
    it("should not call function that is subscribed after event is published", function() {
        spyOn(obj, 'staticMethod');

        $.operator.publish('test:pubsub');
        $.operator.subscribe('test:pubsub', obj.staticMethod);

        expect(obj.staticMethod).not.toHaveBeenCalled();
    });
    it("should call subscribed function", function() {
        spyOn(obj, 'staticMethod');
        $.operator.subscribe('test:pubsub', obj.staticMethod);
        $.operator.publish('test:pubsub');
        expect(obj.staticMethod).toHaveBeenCalled();
    });

    it("should subscribe a method and unsubscribe the same method", function () {
        // this test is currently failing
        var count = 0;
        spyOn(obj, 'staticMethod');
        function tester() {
            count++;
        }
        $.operator.subscribe('test:pubsub', tester);
        $.operator.publish('test:pubsub');
        expect(count).toBe(1);
        $.operator.unsubscribe('test:pubsub', tester);
        $.operator.publish('test:pubsub');
        expect(count).toBe(1);
    });

    it("should fire based on any event that was `ever` published", function () {
        var count = 0;
        function tester() {
            count++;
        }
        $.operator.publish('test:pubsub');
        $.operator.ever('test:pubsub', tester);
        expect(count).toBe(1);
        $.operator.publish('test:pubsub');
        expect(count).toBe(2);
    });

    it('should fire `onceEver` (order of publishing and subscribing does not matter)', function () {
        var count = 0;
        function tester() {
            count++;
        }
        $.operator.publish('test:pubsub');
        expect(count).toBe(0);
        $.operator.onceEver('test:pubsub', tester);
        expect(count).toBe(1);
        $.operator.publish('test:pubsub');
        expect(count).toBe(1);
    });

    it("should only fire an event `once` (mapped to jQuery.one, order of publishing and subscribing matters)", function () {
        var count = 0;
        function tester() {
            count++;
        }
        $.operator.once('test:pubsub-fired', tester);
        $.operator.publish('test:pubsub-fired');
        expect(count).toBe(1);
        $.operator.publish('test:pubsub-fired')
        expect(count).toBe(1);
    });

    it("`subWhen`: should subscribe to multiple events and only fire when all events have fired", function () {
        spyOn(obj, 'staticMethod');
        spyOn(obj, 'staticMethod2');
        spyOn(obj, 'staticMethod3');
        $.operator.subWhen('foo', 'bar').then(obj.staticMethod3);
        $.operator.subscribe('foo', obj.staticMethod);
        $.operator.subscribe('bar', obj.staticMethod2);
        $.operator.publish('foo');
        $.operator.publish('bar');
        expect(obj.staticMethod).toHaveBeenCalled();
        expect(obj.staticMethod2).toHaveBeenCalled();
        expect(obj.staticMethod3).toHaveBeenCalled();
    });

    it("should bind multiple events from one call", function () {
        var count = 0;
        $.operator.subscribe("test:pubsub test:pubsub2", function () {
            count++;
        });
        $.operator.publish("test:pubsub");
        expect(count).toBe(1);
        $.operator.publish("test:pubsub2");
        expect(count).toBe(2);
    });
});