(function (root, factory) {

    'use strict';

    if (typeof module !== 'undefined') {
        factory(require('jquery'));
    } else {
        factory(root.jQuery);
    }

}(typeof window !== 'undefined' ? window : global, function ($) {
    "use strict";
    // shim for pre-existing pub/subs
    if ($.operator) {
        $.each({
            "subscribe" : "on",
            "ever" : "on",
            "once" : "one",
            "onceEver" : "one",
            "unsubscribe" : "off",
            "publish" : "trigger"
        }, function (fn, api) {
            $[fn] = function () {
                $.operator[fn].apply($.operator, arguments);
            };
        });
        $.subWhen = $.operator.subWhen;
        $.getSubscribers = $.operator.getSubscribers;
    }

}));