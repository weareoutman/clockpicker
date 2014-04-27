// Custom event. Translate mouse events to touch events if supported
function CustomEvent(type, options) {
    // Listen touch events in touch screen device, instead of mouse events in desktop.
    var touchSupported = 'ontouchstart' in window,
        eventMap = {
            mousedown: touchSupported ? 'touchstart' : 'mousedown',
            mousemove: touchSupported ? 'touchmove' : 'mousemove',
            mouseup: touchSupported ? 'touchend' : 'mouseup'
        };
    if (touchSupported) {
        if (eventMap[type]) {
            type = eventMap[type];
            if (type === 'touchend') {
                options = { originalEvent: { changedTouches: [options] } };
            } else {
                options = { originalEvent: { touches: [options] } };
            }
        }
    }
    return $.Event(type, options);
}
