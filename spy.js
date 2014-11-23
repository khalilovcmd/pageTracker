function Tracker(loadTime, vid, elems, events, url, timeParams, trackParams, cookieParams) {

    var a = '&';

    // function: to loop through any elements
    var each = function (elements, callback) {
            for (var i = 0; i < elements.length; i++)
                callback(elements[i]);
        },
        // function: to make ajax requests
        ajax = function (surl) {
            var xhr = !!window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
            xhr.open('GET', surl);
            xhr.setRequestHeader("Content-Type", "text/plain");
            xhr.send(null);
        },
        // function: to make ajax requests
        getAdvTimeParams = function (timeValue) {
            var result = url + vid;

            if ('loadTime' in timeParams)
                result += a + timeParams.loadTime + '=' + timeValue.loadTime;
            if ('navigationTime' in timeParams)
                result += a + timeParams.navigationTime + '=' + timeValue.navigationTime;
            if ('fetchTime' in timeParams)
                result += a + timeParams.fetchTime + '=' + timeValue.fetchTime;

            return result;
        },
        // function: to make ajax requests
        getBasicTimeParams = function (timeValue) {
            var result = url + vid;

            if ('loadTime' in timeParams)
                result += a + timeParams.loadTime + '=' + new Date() - loadTime;

            return result;
        },
        // function: to make ajax requests
        getTrackingParams = function (trackingValue) {
            var result = url + vid;

            if ('event' in trackParams)
                result += a + 'event=' + timeParams.event;

            if ('element' in trackParams)
                result += a + 'element=' + timeParams.element;

            return result;
        };


    return {

        // function: tracking all events specified by the user
        eventTrack: function () {
            each(elems, function (tagElement) {
                each(document.getElementsByTagName(tagElement), function (element) {
                    each(events, function (event) {
                        // adding event listeners
                        element.addEventListener(event, function () {
                            // sending ajax request
                            ajax();
                        });
                    });
                })
            });
        },

        // function: tracking time taken to load based on performance api
        timeTrack: function () {

            if (window.performance && window.performance.timing) {
                var t = window.performance.timing,
                    ldt = t.loadEventEnd - t.responseEnd,
                    ft = t.responseEnd - t.fetchStart,
                    nt = t.loadEventEnd - t.navigationStart,
                    url = getAdvTimeParams({
                        loadTime: ldt,
                        navigationTime: nt,
                        fetchTime: ft
                    });

                ajax(url);
            } else {
                ajax(getBasicTimeParams());
            }
        },

        // tracking if cookie is enabled
        cookieTrack: function () {

            var cookieValue = '',
                cookieVid = document.cookie,
                cookieEnabled = (navigator.cookieEnabled) ? true : false;

            //if not IE4+ nor NS6+
            if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
                document.cookie = "c";
                cookieEnabled = (document.cookie.indexOf("c") != -1) ? true : false;
            }

            if (cookieEnabled) {

                // finding the cookie with the name 'WS_VID'
                var nameEQ = 'WS_VID=';
                var ca = cookieVid.split(';');

                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];

                    while (c.charAt(0) == ' ')
                        c = c.substring(1, c.length);

                    if (c.indexOf(nameEQ) == 0)
                        cookieValue = c.substring(nameEQ.length, c.length);
                }
            }

            var result = url + vid +
                a + cookieParams.cookieEnabled + '=' + cookieEnabled +
                a + cookieParams.cookieVid + '=' + cookieValue;

            ajax(result);
        }
    };
}

(function () {

    if (!!window.addEventListener)
        window.addEventListener('load', initTracking);
    else
        window.attachEvent('onload', initTracking);

    function initTracking() {
        setTimeout(function () {
            var trk = new Tracker(
                100, //loadtime
                '200102', //VID
                ['input', 'a'], //elements
                ['mousedown', 'click'], //events
                'http://wap.mozook.com/visitstattracker/tracker.aspx?vid=', //tracking url (original url)
                {
                    visitType: 'visitType',
                    loadTime: 'loadTime',
                    navigationTime: 'navigationTime',
                    fetchTime: 'fetchTime'
                },
                {
                    event: 'ev',
                    elem: 'element'
                }, 
                {
                    cookieEnabled: 'ckExist',
                    cookieVid: 'ckVid'
                }
            );

            trk.timeTrack();
            trk.eventTrack();
            trk.cookieTrack();
        }, 100);
    }
})();