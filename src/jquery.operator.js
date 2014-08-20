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
    var slice = Array.prototype.slice;
    var o = $({});
    var fired = {};
    var originalOperator = $.operator;
    var privateOps = {};
    /** @namespace */
    var operator = {};
    var subscribers = {};

    /**
     * Creates an array of event names
     * @param {string} events A space-delimited string of event names
     * @returns {Array}
     */
    privateOps.getEventNames = function (events) {
        if (typeof events === 'string') {
            return events.split(' ');
        }
        return [];
    };

    /**
     * Returns all the arguments passed into the events
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
     * Checks to see if an event was ever fired,
     * if it was, it will then invoke the callback
     * (assuming a callback was the second argument to the function above)
     * If @onceEver is `true`, it will remove the event listener after-if firing
     * @param {boolean} onceEver
     * @param {mixed} args 
     */
    privateOps.fired = function (onceEver, args) {
        var args = slice.call(args),
            // space delimited events
            eventNames = this.getEventNames(args[0]);
        if (typeof args[1] === 'function') {
            $.each(eventNames, function (i, eventName) {
                if (fired[eventName]) {
                    //Release thread so that event binder can
                    // return before callback is invoked
                    setTimeout(function () {
                        args[1].apply(o, fired[eventName]);
                    }, 15);
                    if (onceEver) {
                        //If this was a onceEver, we need to take it back off now
                        o.off(eventName, args[1]);
                    }
                }
            });
        }
    };

    /**
     * Typical no-conflict mode
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
        if (!subscribers[event]) {
            subscribers[event] = 1;
        } else {
            subscribers[event] = subscribers[event]++;
        }
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
     * A versions of subscribe that can look into the past.
     * If the event being subscribed to has fired in the past,
     * invoke the callback with the most recent occurrence
     * Useful when you don't want to care about the order of script loading
     * NOTE: This function will always return before invoking the callback [15 millisecond timeout]
     */
    operator.ever = function () {
        o.on.apply(o, arguments);
        privateOps.fired(false, arguments);
    };

    /**
     * Same as `subscribe` except that the callback is invoked at most once
     */
    operator.once = function () {
        o.one.apply(o, arguments);
    };

    /**
     * Same as `ever` except that the callback is invoked at most once
     * NOTE: This function will always return before invoking the callback [15 millisecond timeout]
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

    /**
     * @param {string} [name] subscriber name
     * @returns {object|number} Returns a count if `name` is present, otherwise entire list
     */
    operator.getSubscribers = function (name) {
        return subscribers[name] ? subscribers[name] : subscribers;
    };

    // expose this ish
    // don't attach via $.fn since a jQuery object is being used as the switchboard
    $.operator = operator;

})(jQuery);