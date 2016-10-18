/*!
 * ClockPicker v{package.version} (http://weareoutman.github.io/clockpicker/)
 * Copyright 2014 Wang Shenwei.
 * Licensed under MIT (https://github.com/weareoutman/clockpicker/blob/gh-pages/LICENSE)
 */

interface Window {
    jQuery: JQueryStatic;
}
interface Navigator {
    webkitVibrate (pattern: number | number[]) : boolean;
}
interface Event {
    touches;
    changedTouches;
}

interface JQuery {
    clockpicker(): JQuery;
    clockpicker(methodName: 'show'): any; // show the clockpicker
    clockpicker(methodName: 'hide'): any; // hide the clockpicker
    clockpicker(methodName: 'remove'): void; // remove the clockpicker (and event listeners)
    clockpicker(methodName: 'toggleView'): any;  //	'hours' or 'minutes'	toggle to hours or minutes view
    clockpicker(methodName: string): any;
    clockpicker(methodName: string, methodParameter: any): any;
    clockpicker(optionLiteral: string, optionName: string): any;
    clockpicker(options: ClockPickerOptions): JQuery;
}


interface ClockPickerOptions {
    default?: string; // default time, 'now' or '13:14' e.g.
    fromnow?: number; // set default time to * milliseconds from now (using with default = 'now')
    placement?: string; // clock popover placement
    align?: string; // popover arrow align
    donetext?: string; // done button text
    autoclose?: boolean; // auto close when minute is selected
    twelvehour?: boolean; // change to 12 hour AM/PM clock from 24 hour
    vibrate?: boolean;  // vibrate the device when dragging clock hand
    beforeShow?: any; // callback function triggered before popup is shown
    afterShow?: any; // callback function triggered after popup is shown
    beforeDone?: any; // callback function triggered before time is written to input;
    afterDone?: any; // callback function triggered after time is written to input;
    beforeHide?: any; // callback function triggered before popup is hidden; Note: will be triggered between a beforeDone and afterDone
    afterHide?: any; // callback function triggered after popup is hidden. Note: will be triggered between a beforeDone and afterDone
    beforeHourSelect?: any; //callback function triggered before user makes an hour selection;
    afterHourSelect?: any; // callback function triggered after user makes an hour selection;
    init?: any; // callback function triggered after the clockpicker has been initiated
}
interface ClockPickerStyles {
    top?: number;
    left?: number;
}

class ClockPicker {
    /**Default options*/
    static defaultOptions: ClockPickerOptions = {
        default: '',       // default time, 'now' or '13:14' e.g.
        fromnow: 0,          // set default time to * milliseconds from now (using with default = 'now')
        placement: 'bottom', // clock popover placement
        align: 'left',       // popover arrow align
        donetext: 'Done',    // done button text
        autoclose: false,    // auto close when minute is selected
        twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
        vibrate: true        // vibrate the device when dragging clock hand
    };
    static $ = window.jQuery;
    private $win = ClockPicker.$(window);
    private $doc = ClockPicker.$(document);
    private $body: JQuery;
    // Can I use inline svg ?
    static svgNS = 'http://www.w3.org/2000/svg';
    static svgSupported = 'SVGAngle' in window && ((): boolean => {
        let el: HTMLDivElement = document.createElement('div');
        el.innerHTML = '<svg/>';
        let supported = (el.firstChild && el.firstChild.namespaceURI) == ClockPicker.svgNS;
        el.innerHTML = '';
        return supported;
    })();

    // Can I use transition ?
    static transitionSupported = ((): boolean => {
        let style = document.createElement('div').style;
        return 'transition' in style ||
            'WebkitTransition' in style ||
            'MozTransition' in style ||
            'msTransition' in style ||
            'OTransition' in style;
    })();
    // Listen touch events in touch screen device, instead of mouse events in desktop.
    static touchSupported = 'ontouchstart' in window;
    static mousedownEvent = 'mousedown' + (ClockPicker.touchSupported ? ' touchstart' : '');
    static mousemoveEvent = 'mousemove.clockpicker' + (ClockPicker.touchSupported ? ' touchmove.clockpicker' : '');
    static mouseupEvent = 'mouseup.clockpicker' + (ClockPicker.touchSupported ? ' touchend.clockpicker' : '');

    // Vibrate the device if supported
    static vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;
    static createSvgElement(name: string): Element {
        return document.createElementNS(ClockPicker.svgNS, name);
    }
    static leadingZero(num: number): string {
        return (num < 10 ? '0' : '') + num;
    }
    // Get a unique id
    static idCounter = 0;
    static uniqueId(prefix: string): string {
        let id: string = ++ClockPicker.idCounter + '';
        return prefix ? prefix + id : id;
    }

    // Clock size
    private dialRadius = 100;
    private outerRadius = 80;
    private innerRadius = 54;
    private tickRadius = 13;
    private diameter = this.dialRadius * 2;
    private duration = ClockPicker.transitionSupported ? 350 : 1;

    // Popover template
    static tpl: string = `<div class="popover clockpicker-popover">
        <div class="arrow"></div>
        <div class="popover-title">
            <span class="clockpicker-span-hours text-primary"></span> : <span class="clockpicker-span-minutes"></span>
            <span class="clockpicker-span-am-pm"></span>
        </div>
        <div class="popover-content">
            <div class="clockpicker-plate">
                <div class="clockpicker-canvas"></div>
                <div class="clockpicker-dial clockpicker-hours"></div>
                <div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>
            </div>
            <span class="clockpicker-am-pm-block"></span>
        </div>
    </div>`;

    private id: string;
    private element: JQuery;
    private options: ClockPickerOptions;
    private isAppended = false;
    private isShown = false;
    private currentView = 'hours';
    private isInput: boolean;
    private input: JQuery;
    private addon: JQuery;
    private popover: JQuery;
    private plate: JQuery;
    private hoursView: JQuery;
    private minutesView: JQuery;
    private amPmBlock: JQuery;
    private spanHours: JQuery;
    private spanMinutes: JQuery;
    private spanAmPm: JQuery;
    private amOrPm = 'PM';
    private hand: Element;
    private bg: Element;
    private fg: Element;
    private g: Element;
    private bearing: Element;
    private canvas: JQuery;
    private hours;
    private minutes;

    constructor(element: JQuery, options: ClockPickerOptions) {
        this.popover = $(ClockPicker.tpl);
        this.plate = this.popover.find('.clockpicker-plate');
        this.hoursView = this.popover.find('.clockpicker-hours');
        this.minutesView = this.popover.find('.clockpicker-minutes');
        this.amPmBlock = this.popover.find('.clockpicker-am-pm-block');
        this.isInput = element.prop('tagName') === 'INPUT';
        this.input = this.isInput ? element : element.find('input');
        this.addon = element.find('.input-group-addon');
        this.id = ClockPicker.uniqueId('cp');
        this.element = element;
        this.options = options;
        this.spanHours = this.popover.find('.clockpicker-span-hours');
        this.spanMinutes = this.popover.find('.clockpicker-span-minutes');
        this.spanAmPm = this.popover.find('.clockpicker-span-am-pm');
        // Setup for for 12 hour clock if option is selected
        if (options.twelvehour) {
            let amPmButtonsTemplate = `<div class="clockpicker-am-pm-block">
                <button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-am-button">AM</button>
                <button type="button" class="btn btn-sm btn-default clockpicker-button clockpicker-pm-button">PM</button>
            </div>`;
            let amPmButtons = $(amPmButtonsTemplate);
            $('<button type="button" class="btn btn-sm btn-default clockpicker-button am-button">AM</button>')
                .on("click", () => {
                    this.amOrPm = 'AM';
                    $('.clockpicker-span-am-pm').empty().append('AM');
                }).appendTo(this.amPmBlock);
            $('<button type="button" class="btn btn-sm btn-default clockpicker-button pm-button">PM</button>')
                .on("click", () => {
                    this.amOrPm = 'PM';
                    $('.clockpicker-span-am-pm').empty().append('PM');
                }).appendTo(this.amPmBlock);
        }
        if (!options.autoclose) {
            // If autoclose is not set, append a button
            $('<button type="button" class="btn btn-sm btn-default btn-block clockpicker-button">' + options.donetext + '</button>')
                .click($.proxy(this.done, this))
                .appendTo(this.popover);
        }
        // Placement and arrow align - make sure they make sense.
        if ((options.placement === 'top' || options.placement === 'bottom') && (options.align === 'top' || options.align === 'bottom')) options.align = 'left';
        if ((options.placement === 'left' || options.placement === 'right') && (options.align === 'left' || options.align === 'right')) options.align = 'top';
        this.popover.addClass(options.placement);
        this.popover.addClass('clockpicker-align-' + options.align);
        this.spanHours.click($.proxy(this.toggleView, this, 'hours'));
        this.spanMinutes.click($.proxy(this.toggleView, this, 'minutes'));
        // Show or toggle
        this.input.on('focus.clockpicker click.clockpicker', $.proxy(this.show, this));
        this.addon.on('click.clockpicker', $.proxy(this.toggle, this));
        // Build ticks
        let tickTpl = $('<div class="clockpicker-tick"></div>');
        let tick: JQuery;
        let radian: number;
        let radius: number;

        // Mousedown or touchstart
        let mousedown = (e: JQueryEventObject, space: boolean) => {
            let offset = this.plate.offset();
            let isTouch = /^touch/.test(e.type);
            let x0 = offset.left + this.dialRadius;
            let y0 = offset.top + this.dialRadius;
            let dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0;
            let dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
            let z = Math.sqrt(dx * dx + dy * dy);
            let moved = false;

            // When clicking on minutes view space, check the mouse position
            if (space && (z < this.outerRadius - this.tickRadius || z > this.outerRadius + this.tickRadius)) {
                return;
            }
            e.preventDefault();

            // Set cursor style of body after 200ms
            let movingTimer = setTimeout(() => {
                this.$body.addClass('clockpicker-moving');
            }, 200);

            // Place the canvas to top
            if (ClockPicker.svgSupported) {
                this.plate.append(this.canvas);
            }

            // Clock
            this.setHand(dx, dy, !space, true);

            // Mousemove on document
            this.$doc.off(ClockPicker.mousemoveEvent).on(ClockPicker.mousemoveEvent, (e) => {
                e.preventDefault();
                let isTouch = /^touch/.test(e.type),
                    x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
                    y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
                if (!moved && x === dx && y === dy) {
                    // Clicking in chrome on windows will trigger a mousemove event
                    return;
                }
                moved = true;
                this.setHand(x, y, false, true);
            });

            // Mouseup on document
            this.$doc.off(ClockPicker.mouseupEvent).on(ClockPicker.mouseupEvent, (e) => {
                this.$doc.off(ClockPicker.mouseupEvent);
                e.preventDefault();
                let isTouch = /^touch/.test(e.type),
                    x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
                    y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
                if ((space || moved) && x === dx && y === dy) {
                    this.setHand(x, y);
                }
                if (this.currentView === 'hours') {
                    this.toggleView('minutes', this.duration / 2);
                } else {
                    if (options.autoclose) {
                        this.minutesView.addClass('clockpicker-dial-out');
                        setTimeout(() => {
                            this.done();
                        }, this.duration / 2);
                    }
                }
                this.plate.prepend(this.canvas);

                // Reset cursor style of body
                clearTimeout(movingTimer);
                this.$body.removeClass('clockpicker-moving');

                // Unbind mousemove event
                this.$doc.off(ClockPicker.mousemoveEvent);
            });
        }


        // Hours view
        if (options.twelvehour) {
            for (let i = 1; i < 13; i += 1) {
                tick = tickTpl.clone();
                radian = i / 6 * Math.PI;
                radius = this.outerRadius;
                tick.css('font-size', '120%');
                tick.css({
                    left: this.dialRadius + Math.sin(radian) * radius - this.tickRadius,
                    top: this.dialRadius - Math.cos(radian) * radius - this.tickRadius
                });
                tick.html(i === 0 ? '00' : i.toString());
                this.hoursView.append(tick);
                tick.on(ClockPicker.mousedownEvent, mousedown);
            }
        } else {
            for (let i = 0; i < 24; i += 1) {
                tick = tickTpl.clone();
                radian = i / 6 * Math.PI;
                let inner = i > 0 && i < 13;
                radius = inner ? this.innerRadius : this.outerRadius;
                tick.css({
                    left: this.dialRadius + Math.sin(radian) * radius - this.tickRadius,
                    top: this.dialRadius - Math.cos(radian) * radius - this.tickRadius
                });
                if (inner) {
                    tick.css('font-size', '120%');
                }
                tick.html(i === 0 ? '00' : i.toString());
                this.hoursView.append(tick);
                tick.on(ClockPicker.mousedownEvent, mousedown);
            }
        }
        // Minutes view
        for (let i = 0; i < 60; i += 5) {
            tick = tickTpl.clone();
            radian = i / 30 * Math.PI;
            tick.css({
                left: this.dialRadius + Math.sin(radian) * this.outerRadius - this.tickRadius,
                top: this.dialRadius - Math.cos(radian) * this.outerRadius - this.tickRadius
            });
            tick.css('font-size', '120%');
            tick.html(ClockPicker.leadingZero(i));
            this.minutesView.append(tick);
            tick.on(ClockPicker.mousedownEvent, mousedown);
        }
        // Clicking on minutes view space
        this.plate.on(ClockPicker.mousedownEvent, (e) => {
            if ($(e.target).closest('.clockpicker-tick').length === 0) {
                mousedown(e, true);
            }
        });

        if (ClockPicker.svgSupported) {
            // Draw clock hands and others
            let canvas = this.popover.find('.clockpicker-canvas'),
            svg = ClockPicker.createSvgElement('svg');
            svg.setAttribute('class', 'clockpicker-svg');
            svg.setAttribute('width', this.diameter.toString());
            svg.setAttribute('height', this.diameter.toString());
            let g = ClockPicker.createSvgElement('g');
            g.setAttribute('transform', 'translate(' + this.dialRadius + ',' + this.dialRadius + ')');
            let bearing = ClockPicker.createSvgElement('circle');
            bearing.setAttribute('class', 'clockpicker-canvas-bearing');
            bearing.setAttribute('cx', '0');
            bearing.setAttribute('cy', '0');
            bearing.setAttribute('r', '2');
            let hand = ClockPicker.createSvgElement('line');
            hand.setAttribute('x1', '0');
            hand.setAttribute('y1', '0');
            let bg = ClockPicker.createSvgElement('circle');
            bg.setAttribute('class', 'clockpicker-canvas-bg');
            bg.setAttribute('r', this.tickRadius.toString());
            let fg = ClockPicker.createSvgElement('circle');
            fg.setAttribute('class', 'clockpicker-canvas-fg');
            fg.setAttribute('r', '3.5');
            g.appendChild(hand);
            g.appendChild(bg);
            g.appendChild(fg);
            g.appendChild(bearing);
            svg.appendChild(g);
            canvas.append(svg);
            this.hand = hand;
            this.bg = bg;
            this.fg = fg;
            this.bearing = bearing;
            this.g = g;
            this.canvas = canvas;
        }
        this.raiseCallback(this.options.init);
    }
    raiseCallback(callbackFunction: any ): void {
        if (callbackFunction && typeof callbackFunction === "function") {
            callbackFunction();
        }
    }
    // Show or hide popover
    private toggle = () => {
        this[this.isShown ? 'hide' : 'show']();
    };
    // Set popover position
    private locate = () => {
        let element = this.element,
            popover = this.popover,
            offset = element.offset(),
            width = element.outerWidth(),
            height = element.outerHeight(),
            placement = this.options.placement,
            align = this.options.align,
            styles : ClockPickerStyles = {},
            self = this;
        popover.show();

        // Place the popover
        switch (placement) {
            case 'bottom':
                styles.top = offset.top + height;
                break;
            case 'right':
                styles.left = offset.left + width;
                break;
            case 'top':
                styles.top = offset.top - popover.outerHeight();
                break;
            case 'left':
                styles.left = offset.left - popover.outerWidth();
                break;
        }

        // Align the popover arrow
        switch (align) {
            case 'left':
                styles.left = offset.left;
                break;
            case 'right':
                styles.left = offset.left + width - popover.outerWidth();
                break;
            case 'top':
                styles.top = offset.top;
                break;
            case 'bottom':
                styles.top = offset.top + height - popover.outerHeight();
                break;
        }

        popover.css(styles);
    };

    // Show popover
    private show = () => {
        // Not show again
        if (this.isShown) {
            return;
        }

        this.raiseCallback(this.options.beforeShow);

        let self = this;

        // Initialize
        if (!this.isAppended) {
            // Append popover to body
            this.$body = $(document.body).append(this.popover);

            // Reset position when resize
            this.$win.on('resize.clockpicker' + this.id, () => {
                if (this.isShown) {
                    this.locate();
                }
            });

            this.isAppended = true;
        }

        // Get the time
        let value = ((this.input.prop('value') || this.options['default'] || '') + '').split(':');
        if (value[0] === 'now') {
            let now = new Date(+ new Date() + this.options.fromnow);
            value = [
                now.getHours().toString(),
                now.getMinutes().toString()
            ];
        }
        this.hours = + value[0] || 0;
        this.minutes = + value[1] || 0;
        this.spanHours.html(ClockPicker.leadingZero(this.hours));
        this.spanMinutes.html(ClockPicker.leadingZero(this.minutes));

        // Toggle to hours view
        this.toggleView('hours');

        // Set position
        this.locate();

        this.isShown = true;

        // Hide when clicking or tabbing on any element except the clock, input and addon
        this.$doc.on('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id, (e) => {
            let target = $(e.target);
            if (target.closest(this.popover).length === 0 &&
                target.closest(this.addon).length === 0 &&
                target.closest(this.input).length === 0) {
                this.hide();
            }
        });

        // Hide when ESC is pressed
        this.$doc.on('keyup.clockpicker.' + this.id, (e) => {
            if (e.keyCode === 27) {
                this.hide();
            }
        });

        this.raiseCallback(this.options.afterShow);
    };
    // Hide popover
    private hide = () => {
        this.raiseCallback(this.options.beforeHide);

        this.isShown = false;

        // Unbinding events on document
        this.$doc.off('click.clockpicker.' + this.id + ' focusin.clockpicker.' + this.id);
        this.$doc.off('keyup.clockpicker.' + this.id);

        this.popover.hide();

        this.raiseCallback(this.options.afterHide);
    };
    // Toggle to hours or minutes view
    private toggleViewTimer: number;
    private toggleView = (view: string, delay?: number) => {
        let raiseAfterHourSelect = false;
        if (view === 'minutes' && $(this.hoursView).css("visibility") === "visible") {
            this.raiseCallback(this.options.beforeHourSelect);
            raiseAfterHourSelect = true;
        }
        let isHours = view === 'hours',
            nextView = isHours ? this.hoursView : this.minutesView,
            hideView = isHours ? this.minutesView : this.hoursView;

        this.currentView = view;

        this.spanHours.toggleClass('text-primary', isHours);
        this.spanMinutes.toggleClass('text-primary', !isHours);

        // Let's make transitions
        hideView.addClass('clockpicker-dial-out');
        nextView.css('visibility', 'visible').removeClass('clockpicker-dial-out');

        // Reset clock hand
        this.resetClock(delay);

        // After transitions ended
        clearTimeout(this.toggleViewTimer);
        this.toggleViewTimer = setTimeout(() => {
            hideView.css('visibility', 'hidden');
        }, this.duration);

        if (raiseAfterHourSelect) {
            this.raiseCallback(this.options.afterHourSelect);
        }
    };
    // Reset clock hand
    private resetClock = (delay?: number) => {
        let view = this.currentView,
            value = this[view],
            isHours = view === 'hours',
            unit = Math.PI / (isHours ? 6 : 30),
            radian = value * unit,
            radius = isHours && value > 0 && value < 13 ? this.innerRadius : this.outerRadius,
            x = Math.sin(radian) * radius,
            y = - Math.cos(radian) * radius,
            self = this;
        if (ClockPicker.svgSupported && delay) {
            this.canvas.addClass('clockpicker-canvas-out');
            setTimeout(() => {
                this.canvas.removeClass('clockpicker-canvas-out');
                this.setHand(x, y);
            }, delay);
        } else {
            this.setHand(x, y);
        }
    };
    // Set clock hand to (x, y)
    private vibrateTimer: number;
    private setHand = (x: number, y: number, roundBy5?: boolean, dragging?: boolean) => {
        let radian = Math.atan2(x, - y),
            isHours = this.currentView === 'hours',
            unit = Math.PI / (isHours || roundBy5 ? 6 : 30),
            z = Math.sqrt(x * x + y * y),
            inner = isHours && z < (this.outerRadius + this.innerRadius) / 2,
            radius = inner ? this.innerRadius : this.outerRadius;

        if (this.options.twelvehour) {
            radius = this.outerRadius;
        }

        // Radian should in range [0, 2PI]
        if (radian < 0) {
            radian = Math.PI * 2 + radian;
        }

        // Get the round value
        let value = Math.round(radian / unit);

        // Get the round radian
        radian = value * unit;

        // Correct the hours or minutes
        if (this.options.twelvehour) {
            if (isHours) {
                if (value === 0) {
                    value = 12;
                }
            } else {
                if (roundBy5) {
                    value *= 5;
                }
                if (value === 60) {
                    value = 0;
                }
            }
        } else {
            if (isHours) {
                if (value === 12) {
                    value = 0;
                }
                value = inner ? (value === 0 ? 12 : value) : value === 0 ? 0 : value + 12;
            } else {
                if (roundBy5) {
                    value *= 5;
                }
                if (value === 60) {
                    value = 0;
                }
            }
        }

        // Once hours or minutes changed, vibrate the device
        if (this[this.currentView] !== value) {
            if (ClockPicker.vibrate && this.options.vibrate) {
                // Do not vibrate too frequently
                if (!this.vibrateTimer) {
                    navigator[ClockPicker.vibrate](10);
                    this.vibrateTimer = setTimeout($.proxy(() => {
                        this.vibrateTimer = null;
                    }, this), 100);
                }
            }
        }

        this[this.currentView] = value;
        this[isHours ? 'spanHours' : 'spanMinutes'].html(ClockPicker.leadingZero(value));

        // If svg is not supported, just add an active class to the tick
        if (!ClockPicker.svgSupported) {
            this[isHours ? 'hoursView' : 'minutesView'].find('.clockpicker-tick').each(function() {
                let $this = $(this);
                $this.toggleClass('active', value === + $this.html());
            });
            return;
        }

        // Place clock hand at the top when dragging
        if (dragging || (!isHours && value % 5)) {
            this.g.insertBefore(this.hand, this.bearing);
            this.g.insertBefore(this.bg, this.fg);
            this.bg.setAttribute('class', 'clockpicker-canvas-bg clockpicker-canvas-bg-trans');
        } else {
            // Or place it at the bottom
            this.g.insertBefore(this.hand, this.bg);
            this.g.insertBefore(this.fg, this.bg);
            this.bg.setAttribute('class', 'clockpicker-canvas-bg');
        }

        // Set clock hand and others' position
        let cx = Math.sin(radian) * radius,
            cy = - Math.cos(radian) * radius;
        this.hand.setAttribute('x2', cx.toString());
        this.hand.setAttribute('y2', cy.toString());
        this.bg.setAttribute('cx', cx.toString());
        this.bg.setAttribute('cy', cy.toString());
        this.fg.setAttribute('cx', cx.toString());
        this.fg.setAttribute('cy', cy.toString());
    };
    // Hours and minutes are selected
    private done = () => {
        this.raiseCallback(this.options.beforeDone);
        this.hide();
        let last = this.input.prop('value'),
            value = ClockPicker.leadingZero(this.hours) + ':' + ClockPicker.leadingZero(this.minutes);
        if (this.options.twelvehour) {
            value = value + this.amOrPm;
        }

        this.input.prop('value', value);
        if (value !== last) {
            this.input.triggerHandler('change');
            if (!this.isInput) {
                this.element.trigger('change');
            }
        }

        if (this.options.autoclose) {
            this.input.trigger('blur');
        }

        this.raiseCallback(this.options.afterDone);
    };
    // Remove clockpicker from input
    private remove = () => {
        this.element.removeData('clockpicker');
        this.input.off('focus.clockpicker click.clockpicker');
        this.addon.off('click.clockpicker');
        if (this.isShown) {
            this.hide();
        }
        if (this.isAppended) {
            this.$win.off('resize.clockpicker' + this.id);
            this.popover.remove();
        }
    };
}
// Extends $.fn.clockpicker
$.fn.clockpicker = function (option) {
    let args = Array.prototype.slice.call(arguments, 1);
    return this.each(function () {
        let $this = $(this),
            data = $this.data('clockpicker');
        if (!data) {
            let options = $.extend({}, ClockPicker.defaultOptions, $this.data(), typeof option == 'object' && option);
            $this.data('clockpicker', new ClockPicker($this, options));
        } else {
            // Manual operations; show, hide, remove, e.g.
            if (typeof data[option] === 'function') {
                data[option].apply(data, args);
            }
        }
    });
};
