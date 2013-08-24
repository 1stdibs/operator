/*!
 * Dual licensed under the MIT and GPL licenses.
 *
 * Inspired by Ben Alman's original gist - https://gist.github.com/661855
 * Contributors:
 *      - shad downey, github: @andromedado
 *      - dale tan, github: @hellatan
 * Copyright 1stdibs.com, Inc. 2013. All Rights Reserved.
 */

(function($){
    "use strict";
    var slice = Array.prototype.slice,
        o = $({}),
        fired = {},
        originalOperator = $.operator,
        privateOps = {},
        /** @namespace */
        operator = {};

    /**
     * PLEASE WRITE SOMETHING HERE.  I'M BEING LAZY RIGHT NOW
     * @param events
     * @returns {Array}
     */
    privateOps.getEventNames = function (events) {
        if (typeof events === 'string') {
            return events.split(' ');
        }
        return [];
    };

    /**
     * PLEASE WRITE SOMETHING HERE.  I'M BEING LAZY RIGHT NOW
     * @returns {{args: (*|Function), eventNames: *}}
     */
    privateOps.getAllArguments = function () {
        var args = slice.call(arguments), //this.returnArgs(arguments),
            events = args[0];
        return {
            args: args,
            eventNames: events
        };
    };

    /**
     * PLEASE WRITE SOMETHING HERE.  I'M BEING LAZY RIGHT NOW
     * @param onceEver
     * @param args
     */
    privateOps.fired = function (onceEver, args) {
        var args = slice.call(args),
            // space delimited events
            eventNames = this.getEventNames(args[0]);
        if (typeof args[1] === 'function') {
            $.each(eventNames, function (i, eventName) {
                if (fired[eventName]) {
                    args[1].apply(o, fired[eventName]);
                    if (onceEver) {
                        //If this was a onceEver, we need to take it back off now
                        o.off(eventName, args[1]);
                    }
                }
            });
        }
    };

    /**
     * PLEASE WRITE SOMETHING HERE.  I'M BEING LAZY RIGHT NOW
     * @returns {{}}
     */
    operator.noConflict = function () {
        $.operator = originalOperator;
        return operator;
    };

    /**
     * Add methods to listen to custom events that have been published
     * @param {string}      event   The event to subscribe to
     * @param {function}    fn      The method that will be triggered when the {event} is published
     */
    operator.subscribe = function (event, fn) {
        o.on.apply(o, arguments);
    };

    /**
     * Remove the method that was listening to the event.  Anonymous functions cannot be unsubscribed
     * @param {string}      event   The event to be removed
     * @param {function}    fn      The method that was originally subscribed to the {event}
     */
    operator.unsubscribe = function (event, fn) {
        o.off.apply(o, arguments);
    };

    /**
     * The event to trigger
     * @param {string}  event   The event to trigger
     * @param {array}   args    Array of arguments that will be passed along to the subscribers
     */
    operator.publish = function (/* event, args */) {
        var args = arguments,
            eventNames = privateOps.getEventNames(args[0]);
        o.trigger.apply(o, args);
        // We need to keep a record of fired events for `ever`'s sake
        $.each(eventNames, function (i, eventName) {
            fired[eventName] = args;
        });
    };

    /**
     * PLEASE WRITE SOMETHING HERE.  I'M BEING LAZY RIGHT NOW
     */
    operator.ever = function () {
        o.on.apply(o, arguments);
        privateOps.fired(false, arguments);
    };

    /**
     * PLEASE WRITE SOMETHING HERE.  I'M BEING LAZY RIGHT NOW
     */
    operator.once = function () {
        o.one.apply(o, arguments);
    };

    /**
     * PLEASE WRITE SOMETHING HERE.  I'M BEING LAZY RIGHT NOW
     */
    operator.onceEver = function () {
        o.on.apply(o, arguments);
        privateOps.fired(true, arguments);
    };

    /**
     * Takes list of publish event names, and returns a promise for
     * when all of them have ever occurred
     * e.g.
     *      $.operator.subWhen('foo', 'bar').then(function () {
     *          console.log('STUFF GETS DONE!');
     *      });
     *      $.operator.publish('foo');
     *      // subscribers to 'foo' do something
     *      $.operator.publish('bar');
     *      // subscribers to 'bar' do something
     *      // then
     *      // STUFF GETS DONE!
     * @returns jQuery.Promise
     */
    operator.subWhen = function (/* eventName, ... */) {
        var promises = [];
        $.each(arguments, function (i, eventName) {
            var def = $.Deferred();
            $.operator.onceEver(eventName, function () {
                def.resolve.apply(def, arguments);
            });
            promises.push(def.promise());
        });
        return $.when.apply($, promises);
    };

    // expose this ish
    $.operator = operator;

})(jQuery);