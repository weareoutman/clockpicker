/*!
 * ClockPicker v0.2.3 original by (http://weareoutman.github.io/clockpicker/)
 * Copyright 2014 Wang Shenwei.
 * Licensed under MIT (https://github.com/weareoutman/clockpicker/blob/gh-pages/LICENSE)
 * Bootstrap 4 support by djibe
 */

(function($) {
  var $win = $(window),
    $doc = $(document),
    $body;

  // Can I use inline svg ?
  var svgNS = "http://www.w3.org/2000/svg",
    svgSupported =
      "SVGAngle" in window &&
      (function() {
        var supported,
          el = document.createElement("div");
        el.innerHTML = "<svg/>";
        supported = (el.firstChild && el.firstChild.namespaceURI) == svgNS;
        el.innerHTML = "";
        return supported;
      })();

  // Can I use transition ?
  var transitionSupported = (function() {
    var style = document.createElement("div").style;
    return (
      "transition" in style ||
      "WebkitTransition" in style ||
      "MozTransition" in style ||
      "msTransition" in style ||
      "OTransition" in style
    );
  })();

  // Listen touch events in touch screen device, instead of mouse events in desktop.
  var touchSupported = "ontouchstart" in window,
    mousedownEvent = "mousedown" + (touchSupported ? " touchstart" : ""),
    mousemoveEvent =
      "mousemove.clockpicker" +
      (touchSupported ? " touchmove.clockpicker" : ""),
    mouseupEvent =
      "mouseup.clockpicker" + (touchSupported ? " touchend.clockpicker" : "");

  // Vibrate the device if supported
  var vibrate = navigator.vibrate
    ? "vibrate"
    : navigator.webkitVibrate
      ? "webkitVibrate"
      : null;

  function createSvgElement(name) {
    return document.createElementNS(svgNS, name);
  }

  function leadingZero(num) {
    return (num < 10 ? "0" : "") + num;
  }

  // Get a unique id
  var idCounter = 0;
  function uniqueId(prefix) {
    var id = ++idCounter + "";
    return prefix ? prefix + id : id;
  }

  // Clock size
  var dialRadius = 100,
    outerRadius = 80,
    // innerRadius = 80 on 12 hour clock
    innerRadius = 54,
    tickRadius = 13;
  (diameter = dialRadius * 2), (duration = transitionSupported ? 350 : 1);

  // Popover template
  var tpl = [
    '<div class="popover clockpicker-popover">',
    '<div class="arrow"></div>',
    '<div class="popover-header">',
    '<span class="clockpicker-span-hours"></span>',
    ":",
    '<span class="clockpicker-span-minutes text-white-50"></span>',
    '<span class="clockpicker-buttons-am-pm"></span>',
    "</div>",
    '<div class="popover-body">',
    '<div class="clockpicker-plate">',
    '<div class="clockpicker-canvas"></div>',
    '<div class="clockpicker-dial clockpicker-hours"></div>',
    '<div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>',
    "</div>",
    '<div class="clockpicker-close-block justify-content-end"></div>',
    "</div>",
    "</div>"
  ].join("");

  // ClockPicker
  function ClockPicker(element, options) {
    var popover = $(tpl),
      plate = popover.find(".clockpicker-plate"),
      hoursView = popover.find(".clockpicker-hours"),
      minutesView = popover.find(".clockpicker-minutes"),
      isInput = element.prop("tagName") === "INPUT",
      input = isInput ? element : element.find("input"),
      isHTML5 = input.prop("type") === "time",
      addon = element.find(".input-group-addon"),
      popoverBody = popover.find(".popover-body"),
      closeBlock = popoverBody.find(".clockpicker-close-block"),
      self = this,
      timer;

    this.id = uniqueId("cp");
    this.element = element;
    this.options = options;
    this.options.hourstep = this.parseStep(this.options.hourstep, 12);
    this.options.minutestep = this.parseStep(this.options.minutestep, 60);
    this.isAppended = false;
    this.isShown = false;
    this.currentView = "hours";
    this.isInput = isInput;
    this.isHTML5 = isHTML5;
    this.input = input;
    this.addon = addon;
    this.popover = popover;
    this.plate = plate;
    this.hoursView = hoursView;
    this.minutesView = minutesView;
    this.spanHours = popover.find(".clockpicker-span-hours");
    this.spanMinutes = popover.find(".clockpicker-span-minutes");
    this.buttonsAmPm = popover.find(".clockpicker-buttons-am-pm");
    this.currentPlacementClass = options.placement;
    this.raiseCallback = function() {
      raiseCallback.apply(self, arguments);
    };

    // Setup for for 12 hour clock if option is selected
    if (options.twelvehour) {
      $(this.buttonsAmPm).css("display", "flex");

      $('<a class="btn-am">AM</a>')
        .on("click", function() {
          self.amOrPm = "AM";
          $(this).removeClass("text-white-50");
          $(".btn-pm").addClass("text-white-50");
          if (options.ampmSubmit) {
            setTimeout(function() {
              self.done();
            }, duration / 2);
          }
        })
        .appendTo(this.buttonsAmPm);

      $('<a class="btn-pm text-white-50">PM</a>')
        .on("click", function() {
          self.amOrPm = "PM";
          $(this).removeClass("text-white-50");
          $(".btn-am").addClass("text-white-50");
          if (options.ampmSubmit) {
            setTimeout(function() {
              self.done();
            }, duration / 2);
          }
        })
        .appendTo(this.buttonsAmPm);
    }

    if (!options.autoclose) {
      // If autoclose is not setted, append a button
      closeBlock
        .append(
          '<button type="button" class="btn btn-sm btn-outline-primary cancel">' +
            options.canceltext +
            "</button>"
        )
        .on("click", ".cancel", function () {
          self.hide();
        });

      closeBlock
        .css("display", "flex")
        .append(
          '<button type="button" class="btn btn-sm btn-outline-primary done">' +
            options.donetext +
            "</button>"
        )
        .on("click", ".done", $.proxy(this.done, this));
    }

    // Placement and arrow align - make sure they make sense.
    if (
      /^(top|bottom)/.test(options.placement) &&
      (options.align === "top" || options.align === "bottom")
    )
      options.align = "left";
    if (
      (options.placement === "left" || options.placement === "right") &&
      (options.align === "left" || options.align === "right")
    )
      options.align = "top";

    popover.addClass(options.placement);
    popover.addClass("clockpicker-align-" + options.align);

    this.spanHours.click($.proxy(this.toggleView, this, "hours"));
    this.spanMinutes.click($.proxy(this.toggleView, this, "minutes"));

    // Show or toggle
    if (!options.addonOnly) {
      input.on("focus.clockpicker click.clockpicker", $.proxy(this.show, this));
    }
    addon.on("click.clockpicker", $.proxy(this.toggle, this));

    // Build ticks
    var tickTpl = $('<div class="clockpicker-tick"></div>'),
      i,
      tick,
      radian,
      radius;

    // Hours view
    if (options.twelvehour) {
      for (i = 0; i < 12; i += options.hourstep) {
        tick = tickTpl.clone();
        radian = (i / 6) * Math.PI;
        radius = outerRadius;
        tick.css("font-size", "120%");
        tick.css({
          left: dialRadius + Math.sin(radian) * radius - tickRadius,
          top: dialRadius - Math.cos(radian) * radius - tickRadius
        });
        tick.html(i === 0 ? 12 : i);
        hoursView.append(tick);
        tick.on(mousedownEvent, mousedown);
      }
    } else {
      for (i = 0; i < 24; i += options.hourstep) {
        var isDisabled = false;
        if (
          options.disabledhours &&
          $.inArray(i, options.disabledhours) != -1
        ) {
          var isDisabled = true;
        }
        tick = tickTpl.clone();
        radian = (i / 6) * Math.PI;
        var inner = i > 0 && i < 13;
        radius = inner ? innerRadius : outerRadius;
        tick.css({
          left: dialRadius + Math.sin(radian) * radius - tickRadius,
          top: dialRadius - Math.cos(radian) * radius - tickRadius
        });
        if (inner) {
          tick.css("font-size", "120%");
        }
        if (isDisabled) {
          tick.addClass("disabled");
        }
        tick.html(i === 0 ? "00" : i);
        hoursView.append(tick);
        if (!isDisabled) {
          tick.on(mousedownEvent, mousedown);
        }
      }
    }

    // Minutes view
    var incrementValue = Math.max(options.minutestep, 5);
    for (i = 0; i < 60; i += incrementValue) {
      tick = tickTpl.clone();
      radian = (i / 30) * Math.PI;
      tick.css({
        left: dialRadius + Math.sin(radian) * outerRadius - tickRadius,
        top: dialRadius - Math.cos(radian) * outerRadius - tickRadius
      });
      tick.css("font-size", "120%");
      tick.html(leadingZero(i));
      minutesView.append(tick);
      tick.on(mousedownEvent, mousedown);
    }

    // Clicking on minutes view space
    plate.on(mousedownEvent, function(e) {
      if ($(e.target).closest(".clockpicker-tick").length === 0) {
        mousedown(e, true);
      }
    });

    // Mousedown or touchstart
    function mousedown(e, space) {
      var offset = plate.offset(),
        isTouch = /^touch/.test(e.type),
        x0 = offset.left + dialRadius,
        y0 = offset.top + dialRadius,
        dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
        dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0,
        z = Math.sqrt(dx * dx + dy * dy),
        moved = false;

      // When clicking on minutes view space, check the mouse position
      if (
        space &&
        (z < outerRadius - tickRadius || z > outerRadius + tickRadius)
      ) {
        return;
      }
      e.preventDefault();

      // Set cursor style of body after 200ms
      var movingTimer = setTimeout(function() {
        $body.addClass("clockpicker-moving");
      }, 200);

      // Place the canvas to top
      if (svgSupported) {
        plate.append(self.canvas);
      }

      // Clock
      self.setHand(dx, dy, true);

      // Mousemove on document
      $doc.off(mousemoveEvent).on(mousemoveEvent, function(e) {
        e.preventDefault();
        var isTouch = /^touch/.test(e.type),
          x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
          y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
        if (!moved && x === dx && y === dy) {
          // Clicking in chrome on windows will trigger a mousemove event
          return;
        }
        moved = true;
        self.setHand(x, y, true);
      });

      // Mouseup on document
      $doc.off(mouseupEvent).on(mouseupEvent, function(e) {
        $doc.off(mouseupEvent);
        e.preventDefault();
        var isTouch = /^touch/.test(e.type),
          x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
          y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
        if ((space || moved) && x === dx && y === dy) {
          self.setHand(x, y);
        }
        if (self.currentView === "hours") {
          self.toggleView("minutes", duration / 2);
        } else {
          if (options.autoclose) {
            if (!options.ampmSubmit) {
              self.minutesView.addClass("clockpicker-dial-out");
              setTimeout(function() {
                self.done();
              }, duration / 2);
            }
          }
        }
        plate.prepend(canvas);

        // Reset cursor style of body
        clearTimeout(movingTimer);
        $body.removeClass("clockpicker-moving");

        // Unbind mousemove event
        $doc.off(mousemoveEvent);
      });
    }

    if (svgSupported) {
      // Draw clock hands and others
      var canvas = popover.find(".clockpicker-canvas"),
        svg = createSvgElement("svg");
      svg.setAttribute("class", "clockpicker-svg");
      svg.setAttribute("width", diameter);
      svg.setAttribute("height", diameter);
      var g = createSvgElement("g");
      g.setAttribute(
        "transform",
        "translate(" + dialRadius + "," + dialRadius + ")"
      );
      var bearing = createSvgElement("circle");
      bearing.setAttribute("class", "clockpicker-canvas-bearing");
      bearing.setAttribute("cx", 0);
      bearing.setAttribute("cy", 0);
      bearing.setAttribute("r", 3);
      var hand = createSvgElement("line");
      hand.setAttribute("x1", 0);
      hand.setAttribute("y1", 0);
      var bg = createSvgElement("circle");
      bg.setAttribute("class", "clockpicker-canvas-bg");
      bg.setAttribute("r", tickRadius);
      var fg = createSvgElement("circle");
      fg.setAttribute("class", "clockpicker-canvas-fg");
      fg.setAttribute("r", 3.5);
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

    this.raiseCallback(this.options.init, "init");
  }

  function raiseCallback(callbackFunction, triggerName) {
    if (
      callbackFunction &&
      typeof callbackFunction === "function" &&
      this.element
    ) {
      var time = this.getTime() || null;
      callbackFunction.call(this.element, time);
    }
    if (triggerName) {
      this.element.trigger("clockpicker." + triggerName || "NoName");
    }
  }

  /**
   * Find most suitable vertical placement, doing our best to ensure it is inside of the viewport.
   *
   * First try to place the element according with preferredPlacement, then try the opposite
   * placement and as a last resort, popover will be placed on the very top of the viewport.
   *
   * @param {jQuery} element
   * @param {jQuery} popover
   * @param preferredPlacement Preferred placement, if there is enough room for it.
   * @returns {string} One of: 'top', 'bottom' or 'viewport-top'.
   */
  function resolveAdaptiveVerticalPlacement(
    element,
    popover,
    preferredPlacement
  ) {
    var popoverHeight = popover.outerHeight(),
      elementHeight = element.outerHeight(),
      elementTopOffset = element.offset().top,
      elementBottomOffset = element.offset().top + elementHeight,
      minVisibleY = elementTopOffset - element[0].getBoundingClientRect().top,
      maxVisibleY = minVisibleY + document.documentElement.clientHeight,
      isEnoughRoomAbove = elementTopOffset - popoverHeight >= minVisibleY,
      isEnoughRoomBelow = elementBottomOffset + popoverHeight <= maxVisibleY;

    if (preferredPlacement === "top") {
      if (isEnoughRoomAbove) {
        return "top";
      } else if (isEnoughRoomBelow) {
        return "bottom";
      }
    } else {
      if (isEnoughRoomBelow) {
        return "bottom";
      } else if (isEnoughRoomAbove) {
        return "top";
      }
    }

    return "viewport-top";
  }

  ClockPicker.prototype.parseStep = function(givenStepSize, wholeSize) {
    return wholeSize % givenStepSize === 0 ? givenStepSize : 1;
  };

  // Default options
  ClockPicker.DEFAULTS = {
    default: "", // default time, 'now' or '13:14' e.g.
    fromnow: 0, // set default time to * milliseconds from now (using with default = 'now')
    placement: "bottom", // clock popover placement
    align: "left", // popover arrow align
    donetext: "OK", // done button text
    canceltext: "Cancel", // cancel button text
    autoclose: false, // auto close when minute is selected
    twelvehour: false, // change to 12 hour AM/PM clock from 24 hour
    vibrate: true, // vibrate the device when dragging clock hand
    hourstep: 1, // allow to multi increment the hour
    minutestep: 1, // allow to multi increment the minute
    ampmSubmit: false, // allow submit with AM and PM buttons instead of the minute selection/picker
    addonOnly: false, // only open on clicking on the input-addon
    disabledhours: null // disabled hours (only 24 hour mode)
  };

  // Show or hide popover
  ClockPicker.prototype.toggle = function() {
    this[this.isShown ? "hide" : "show"]();
  };

  // Set new placement class for popover and remove the old one, if any.
  ClockPicker.prototype.updatePlacementClass = function(newClass) {
    if (this.currentPlacementClass) {
      this.popover.removeClass(this.currentPlacementClass);
    }
    if (newClass) {
      this.popover.addClass(newClass);
    }

    this.currentPlacementClass = newClass;
  };

  // Set popover position and update placement class, if needed
  ClockPicker.prototype.locate = function() {
    var element = this.element,
        popover = this.popover,
        offset = element.offset(),
        width = element.outerWidth(),
        height = element.outerHeight(),
        placement = this.options.placement,
        align = this.options.align,
        windowHeight = $win.height(),
        windowWidth = $win.width(),
        popoverHeight = popover.height(),
        popoverWidth = popover.width(),
        styles = {},
        self = this;

    if (placement === "top-adaptive" || placement === "bottom-adaptive") {
      var preferredPlacement = placement.substr(0, placement.indexOf("-"));
      // Adaptive placement should be resolved into one of the "static" placement
      // options, that is best suitable for the current window scroll position.
      placement = resolveAdaptiveVerticalPlacement(
        element,
        popover,
        preferredPlacement
      );

      this.updatePlacementClass(placement !== "viewport-top" ? placement : "");
    }

    popover.show();

    // Place the popover
    switch (placement) {
      case "bottom":
        styles.top = offset.top + height;
        break;
      case "right":
        styles.left = offset.left + width;
        break;
      case "top":
        styles.top = offset.top - popover.outerHeight();
        break;
      case "left":
        styles.left = offset.left - popover.outerWidth();
        break;
      case "viewport-top":
        styles.top = offset.top - element[0].getBoundingClientRect().top;
        break;
    }

    // Align the popover arrow
    switch (align) {
      case "left":
        styles.left = offset.left;
        break;
      case "right":
        styles.left = offset.left + width - popover.outerWidth();
        break;
      case "top":
        styles.top = offset.top;
        break;
      case "bottom":
        styles.top = offset.top + height - popover.outerHeight();
        break;
    }
     
    // Correct the popover position outside the window
    if (popoverHeight + styles.top > windowHeight) {
        styles.top = windowHeight - popoverHeight;
    }
    if (popoverWidth + styles.left > windowWidth) {
        styles.left = windowWidth - popoverWidth;
    }
    
    popover.css(styles);
  };

  // The input can be changed by the user
  // So before we can use this.hours/this.minutes we must update it
  ClockPicker.prototype.parseInputValue = function() {
    var value = this.input.prop("value") || this.options["default"] || "";

    if (value === "now") {
      value = new Date(+new Date() + this.options.fromnow);
    }
    if (value instanceof Date) {
      value = value.getHours() + ":" + value.getMinutes();
    }

    value = value.split(":");

    // Minutes can have AM/PM that needs to be removed
    this.hours = +value[0] || 0;
    this.minutes = +(value[1] + "").replace(/\D/g, "") || 0;

    this.hours =
      Math.round(this.hours / this.options.hourstep) * this.options.hourstep;
    this.minutes =
      Math.round(this.minutes / this.options.minutestep) *
      this.options.minutestep;

    if (this.options.twelvehour) {
      var period = (value[1] + "").replace(/\d+/g, "").toLowerCase();
      //this.amOrPm = this.hours > 12 || period === "pm" ? "PM" : "AM";
      this.amOrPm = this.hours < 12 || period === "am" ? "AM" : "PM";
    }
  };

  // Show popover
  ClockPicker.prototype.show = function(e) {
    // Not show again
    if (this.isShown) {
      return;
    }

    this.raiseCallback(this.options.beforeShow, "beforeShow");

    var self = this;

    // Initialize
    if (!this.isAppended) {
      // Append popover to body
      $body = $(document.body).append(this.popover);

      // Reset position when resize
      $win.on("resize.clockpicker" + this.id, function() {
        if (self.isShown) {
          self.locate();
        }
      });

      this.isAppended = true;
    }

    // Get the time from the input field
    this.parseInputValue();

    this.spanHours.html(leadingZero(this.hours));
    this.spanMinutes.html(leadingZero(this.minutes));

    // Toggle to hours view
    this.toggleView("hours");

    // Set position
    this.locate();

    this.isShown = true;

    // Hide when clicking or tabbing on any element except the clock, input and addon
    $doc.on(
      "click.clockpicker." + this.id + " focusin.clockpicker." + this.id,
      function(e) {
        var target = $(e.target);
        if (
          target.closest(self.popover).length === 0 &&
          target.closest(self.addon).length === 0 &&
          target.closest(self.input).length === 0
        ) {
          self.hide();
        }
      }
    );

    // Hide when ESC is pressed
    $doc.on("keyup.clockpicker." + this.id, function(e) {
      if (e.keyCode === 27) {
        self.hide();
      }
    });

    this.raiseCallback(this.options.afterShow, "afterShow");
  };

  // Hide popover
  ClockPicker.prototype.hide = function() {
    this.raiseCallback(this.options.beforeHide, "beforeHide");

    this.isShown = false;

    // Unbinding events on document
    $doc.off(
      "click.clockpicker." + this.id + " focusin.clockpicker." + this.id
    );
    $doc.off("keyup.clockpicker." + this.id);

    this.popover.hide();

    this.raiseCallback(this.options.afterHide, "afterHide");
  };

  // Toggle to hours or minutes view
  ClockPicker.prototype.toggleView = function(view, delay) {
    var raiseAfterHourSelect = false;
    if (
      view === "minutes" &&
      $(this.hoursView).css("visibility") === "visible"
    ) {
      this.raiseCallback(this.options.beforeHourSelect, "beforeHourSelect");
      raiseAfterHourSelect = true;
    }
    var isHours = view === "hours",
      nextView = isHours ? this.hoursView : this.minutesView,
      hideView = isHours ? this.minutesView : this.hoursView;

    this.currentView = view;

    this.spanHours.toggleClass("text-white-50", !isHours);
    this.spanMinutes.toggleClass("text-white-50", isHours);

    // Let's make transitions
    hideView.addClass("clockpicker-dial-out");
    nextView.css("visibility", "visible").removeClass("clockpicker-dial-out");

    // Reset clock hand
    this.resetClock(delay);

    // After transitions ended
    clearTimeout(this.toggleViewTimer);
    this.toggleViewTimer = setTimeout(function() {
      hideView.css("visibility", "hidden");
    }, duration);

    if (raiseAfterHourSelect) {
      this.raiseCallback(this.options.afterHourSelect, "afterHourSelect");
    }
  };

  // Reset clock hand
  ClockPicker.prototype.resetClock = function(delay) {
    var view = this.currentView,
      value = this[view],
      isHours = view === "hours",
      unit = Math.PI / (isHours ? 6 : 30),
      radian = value * unit,
      radius = isHours && value > 0 && value < 13 ? innerRadius : outerRadius,
      x = Math.sin(radian) * radius,
      y = -Math.cos(radian) * radius,
      self = this;
    if (svgSupported && delay) {
      self.canvas.addClass("clockpicker-canvas-out");
      setTimeout(function() {
        self.canvas.removeClass("clockpicker-canvas-out");
        self.setHand(x, y);
      }, delay);
    } else {
      this.setHand(x, y);
    }
  };

  // Set clock hand to (x, y)
  ClockPicker.prototype.setHand = function(x, y, dragging) {
    var radian = Math.atan2(x, -y),
      isHours = this.currentView === "hours",
      z = Math.sqrt(x * x + y * y),
      options = this.options,
      inner = isHours && z < (outerRadius + innerRadius) / 2,
      radius = inner ? innerRadius : outerRadius,
      unit,
      value;

    // Calculate the unit
    if (isHours) {
      unit = (options.hourstep / 6) * Math.PI;
    } else {
      unit = (options.minutestep / 30) * Math.PI;
    }

    if (options.twelvehour) {
      radius = outerRadius;
    }

    // Radian should in range [0, 2PI]
    if (radian < 0) {
      radian = Math.PI * 2 + radian;
    }

    // Get the round value
    value = Math.round(radian / unit);

    // Get the round radian
    radian = value * unit;

    // Correct the hours or minutes
    if (isHours) {
      value *= options.hourstep;

      if (!options.twelvehour && !inner == value > 0) {
        value += 12;
      }
      if (options.twelvehour && value === 0) {
        value = 12;
      }
      if (value === 24) {
        value = 0;
      }
      if (
        dragging &&
        !options.twelvehour &&
        options.disabledhours &&
        $.inArray(value, options.disabledhours) != -1
      ) {
        return;
      }
    } else {
      value *= options.minutestep;
      if (value === 60) {
        value = 0;
      }
    }

    // Once hours or minutes changed, vibrate the device
    if (this[this.currentView] !== value) {
      if (vibrate && this.options.vibrate) {
        // Do not vibrate too frequently
        if (!this.vibrateTimer) {
          navigator[vibrate](10);
          this.vibrateTimer = setTimeout(
            $.proxy(function() {
              this.vibrateTimer = null;
            }, this),
            100
          );
        }
      }
    }

    this[this.currentView] = value;
    this[isHours ? "spanHours" : "spanMinutes"].html(leadingZero(value));

    // If svg is not supported, just add an active class to the tick
    if (!svgSupported) {
      this[isHours ? "hoursView" : "minutesView"]
        .find(".clockpicker-tick")
        .each(function() {
          var tick = $(this);
          tick.toggleClass("active", value === +tick.html());
        });
      return;
    }

    // Place clock hand at the top when dragging
    if (dragging || (!isHours && value % 5)) {
      this.g.insertBefore(this.hand, this.bearing);
      this.g.insertBefore(this.bg, this.fg);
      this.bg.setAttribute(
        "class",
        "clockpicker-canvas-bg clockpicker-canvas-bg-trans"
      );
    } else {
      // Or place it at the bottom
      this.g.insertBefore(this.hand, this.bg);
      this.g.insertBefore(this.fg, this.bg);
      this.bg.setAttribute("class", "clockpicker-canvas-bg");
    }

    // Set clock hand and others' position
    var cx = Math.sin(radian) * radius,
      cy = -Math.cos(radian) * radius;
    this.hand.setAttribute("x2", cx);
    this.hand.setAttribute("y2", cy);
    this.bg.setAttribute("cx", cx);
    this.bg.setAttribute("cy", cy);
    this.fg.setAttribute("cx", cx);
    this.fg.setAttribute("cy", cy);
  };

  // Allow user to get time time as Date object
  ClockPicker.prototype.getTime = function(callback) {
    var hours = this.hours;
    if (this.options.twelvehour && hours < 12 && this.amOrPm === "PM") {
      hours += 12;
    }

    var selectedTime = new Date();
    selectedTime.setMinutes(this.minutes);
    selectedTime.setHours(hours);
    selectedTime.setSeconds(0);

    return (
      (callback && callback.apply(this.element, selectedTime)) || selectedTime
    );
  };

  // Hours and minutes are selected
  ClockPicker.prototype.done = function() {
    this.raiseCallback(this.options.beforeDone, "beforeDone");
    this.hide();
    var last = this.input.prop("value"),
      outHours = this.hours,
      value = ":" + leadingZero(this.minutes);

    if (this.isHTML5 && this.options.twelvehour) {
      if (this.hours < 12 && this.amOrPm === "PM") {
        outHours += 12;
      }
      if (this.hours === 12 && this.amOrPm === "AM") {
        outHours = 0;
      }
    }

    value = leadingZero(outHours) + value;

    if (!this.isHTML5 && this.options.twelvehour) {
      value = value + this.amOrPm;
    }

    this.input.prop("value", value);
    if (value !== last) {
      this.input.trigger("change");
      if (!this.isInput) {
        this.element.trigger("change");
      }
    }

    if (this.options.autoclose) {
      this.input.trigger("blur");
    }

    this.raiseCallback(this.options.afterDone, "afterDone");
  };

  // Remove clockpicker from input
  ClockPicker.prototype.remove = function() {
    this.element.removeData("clockpicker");
    this.input.off("focus.clockpicker click.clockpicker");
    this.addon.off("click.clockpicker");
    if (this.isShown) {
      this.hide();
    }
    if (this.isAppended) {
      $win.off("resize.clockpicker" + this.id);
      this.popover.remove();
    }
  };

  // Extends $.fn.clockpicker
  $.fn.clockpicker = function(option) {
    var args = Array.prototype.slice.call(arguments, 1);

    function handleClockPickerRequest() {
      var $this = $(this),
        data = $this.data("clockpicker");
      if (!data) {
        var options = $.extend(
          {},
          ClockPicker.DEFAULTS,
          $this.data(),
          typeof option == "object" && option
        );
        $this.data("clockpicker", new ClockPicker($this, options));
      } else {
        // Manual operations. show, hide, remove, getTime, e.g.
        if (typeof data[option] === "function") {
          return data[option].apply(data, args);
        }
      }
    }

    // If we explicitly do a call on a single element then we can return the value (if needed)
    // This allows us, for example, to return the value of getTime
    if (this.length == 1) {
      var returnValue = handleClockPickerRequest.apply(this[0]);

      // If we do not have any return value then return the object itself so you can chain
      return returnValue !== undefined ? returnValue : this;
    }

    // If we do have a list then we do not care about return values
    return this.each(handleClockPickerRequest);
  };
})(jQuery);
