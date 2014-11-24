function Tracker(timeTrack, elementTrack, cookieTrack, extraTrack) {

    var q = '?',
        a = '&',
        e = '=';

    // function: to loop through any elements
    var each = function (elements, callback) {
            for (var i = 0; i < elements.length; i++)
                callback(elements[i]);
        },
        // function: to make ajax requests
        ajax = function (url) {

            try {
                var xhr = !!window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
                xhr.open('GET', url);
                xhr.setRequestHeader("Content-Type", "text/plain");
                xhr.send(null);
            } catch (e) {
                throw e;
            }
        },
        // function: to parse & get a cookie value
        getCookieValue = function (name) {

            // get cookie value
            var cookie = document.cookie.split(';'),
                cookieValue;

            for (var i = 0; i < cookie.length; i++) {
                var c = cookie[i];

                while (c.charAt(0) == ' ')
                    c = c.substring(1, c.length);

                if (c.indexOf(name) == 0)
                    cookieValue = c.substring(name.length, c.length);
            }

            return cookieValue;
        },
        getExtraParams = function () {
            var url = '';

            if (extraTrack && extraTrack.length > 0) {

                // loop through (params, values) in "extraTrack" object
                for (var i = 0; i < extraTrack.length; i++) {

                    // adding all params,values to the url
                    if (i == extraTrack.length - 1)
                        url += extraTrack[i].param + e + extraTrack[i].value;
                    else
                        url += extraTrack[i].param + e + extraTrack[i].value + a;
                }
            }

            return url;
        };


    return {

        // 1. go through all elements provided by user
        // 2. get all elements by tag
        // 3. get all events
        // 4. check if event exists in element
        // 5. add event handler to the element
        // 6. when event occurs, fire an ajax call to a url
        eventTrack: function () {

            if (elementTrack) {

                var elems = elementTrack.elements,
                    events = elementTrack.events;

                if (elems.length > 0 && elementTrack.events.length > 0) {
                    each(elems, function (tagElement) {
                        each(document.getElementsByTagName(tagElement), function (element) {
                            each(events, function (event) {
                                element.addEventListener(event, function () {
                                    var url = elementTrack.url + q +
                                        elementTrack.elementParam + e + element.tagName + a +
                                        elementTrack.eventParam + e + event;
                                    ajax(url + a + getExtraParams());
                                });
                            });
                        })
                    });
                }
            }
        },

        // 1. check on window.performance.timing api existence
        // 2. if exists, get loadTime, fetchTime and navigationTime
        // 3. if doesn't, get loadTime only
        // 4. fire an ajax call
        timeTrack: function () {

            if (timeTrack && timeTrack.init) {
                if (window.performance && window.performance.timing) {
                    var url,
                        t = window.performance.timing,
                        ldt = t.loadEventEnd - t.responseEnd,
                        ft = t.responseEnd - t.fetchStart,
                        nt = t.loadEventEnd - t.navigationStart;

                    url = timeTrack.url + q;

                    if (timeTrack.loadTimeParam)
                        url += timeTrack.loadTimeParam + e + ldt + a;

                    if (timeTrack.fetchTimeParam)
                        url += timeTrack.fetchTimeParam + e + ft + a;

                    if (timeTrack.navigationTimeParam)
                        url += timeTrack.navigationTimeParam + e + nt;

                    ajax(url + a + getExtraParams());
                } else {
                    ajax(url + q + timeTrack.fetchTimeParam + e + (new Date() - timeTrack.init) + a + getExtraParams());
                }
            }
        },

        // 1. check if the cookie feature is enabled (navigator.cookieEnabled)
        // 2. if cookie enabled, then go through all cookie keys and retrieve values
        // 3. fire an ajax call
        cookieTrack: function () {

            if (cookieTrack && cookieTrack.url) {

                var url, cookies, cookieEnabled;

                cookieEnabled = (navigator.cookieEnabled) ? true : false;

                //if not IE4+ nor NS6+
                if (typeof navigator.cookieEnabled == "undefined") {
                    document.cookie = "c";
                    cookieEnabled = (document.cookie.indexOf("c") != -1) ? true : false;
                }

                if (cookieEnabled && cookieTrack.cookieEnabledParam) {

                    url = cookieTrack.url + q + cookieTrack.cookieEnabledParam + e + cookieEnabled + a;

                    for (var i = 0; i < cookieTrack.cookies.length; i++) {
                        var cookieValue = getCookieValue(cookieTrack.cookies[i]);

                        if (cookieValue)
                            url += cookieTrack.cookies[i] + cookieValue + a;
                    }
                }

                ajax(url + getExtraParams());
            }
        }
    };
}


var timeTrack = {
    init: new Date(),
    loadTimeParam: 'loadTime',
    navigationTimeParam: 'navigationTime',
    fetchTimeParam: 'fetchTime',
    url: 'http://www.mobitrans.net'
};

var elementTrack = {
    eventParam: 'event',
    elementParam: 'element',
    elements: ['a', 'input', 'button'],
    events: ['mouseover'],
    url: 'http://www.mobitrans.net'
};

var cookieTrack = {
    cookieEnabledParam: 'cookieEnabled',
    cookies: ['ws_vid', 'mycookie', 'anothercookie'],
    url: 'http://www.mobitrans.net'
};

var extraTrack = [
    {
        param: 'vid',
        value: '201312'
    }
    ];

(function () {

    if (!!window.addEventListener)
        window.addEventListener('load', initTracking);
    else
        window.attachEvent('onload', initTracking);

    function initTracking() {
        setTimeout(function () {
            var trk = new Tracker(timeTrack, elementTrack, cookieTrack, extraTrack);

            trk.eventTrack();
            trk.timeTrack();
            trk.cookieTrack();
        }, 100);
    }
})();