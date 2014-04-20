;(function(){
	var $ = window.$,
		$doc = $(document);

	var svgNS = 'http://www.w3.org/2000/svg',
		svgSupported = 'SVGAngle' in window && (function(){
			var supported,
				el = document.createElement('div');
			el.innerHTML = '<svg/>';
			supported = (el.firstChild && el.firstChild.namespaceURI) == svgNS;
			el.innerHTML = '';
			return supported;
		})();

	var touchSupported = 'ontouchstart' in window,
		mousedownEvent = touchSupported ? 'touchstart' : 'mousedown',
		mousemoveEvent = touchSupported ? 'touchmove' : 'mousemove',
		mouseupEvent = touchSupported ? 'touchend' : 'mouseup';

	var vibrate = navigator.vibrate ? 'vibrate' : navigator.webkitVibrate ? 'webkitVibrate' : null;

	function createSvgElement(name) {
		return document.createElementNS(svgNS, name);
	}
	function leadingZero(num) {
		return (num < 10 ? '0' : '') + num;
	}

	function ClockPicker(element, options) {
		var popover = $(tpl),
			plate = popover.find('.clockpicker-plate'),
			hoursView = popover.find('.clockpicker-hours'),
			minutesView = popover.find('.clockpicker-minutes'),
			isInput = element.prop('tagName') === 'INPUT',
			input = isInput ? element : element.find('input'),
			addon = element.find('.input-group-addon'),
			dialRadius = options.dialRadius,
			innerRadius = options.innerRadius,
			outerRadius = options.outerRadius,
			tickRadius = options.tickRadius,
			duration = options.duration,
			diameter = dialRadius * 2,
			self = this,
			timer;

		this.element = element;
		this.options = options;
		this.isShown = false;
		this.currentView = 'hours';
		this.isInput = isInput;
		this.input = input;
		this.addon = addon;
		this.popover = popover;
		this.plate = plate;
		this.hoursView = hoursView;
		this.minutesView = minutesView;
		this.spanHours = popover.find('.clockpicker-span-hours');
		this.spanMinutes = popover.find('.clockpicker-span-minutes');
		if (! options.autoclose) {
			this.button = $('<button type="button" class="btn btn-sm btn-default btn-block clockpicker-button">' + options.donetext + '</button>');
			this.button.insertAfter(plate);
			this.button.click($.proxy(this.done, this));
		}
		popover.addClass(options.placement);
		popover.addClass('clockpicker-align-' + options.align);

		this.spanHours.click(function(){
			self.toggleView('hours');
		});
		this.spanMinutes.click(function(){
			self.toggleView('minutes');
		});

		input.on('focus.clockpicker', $.proxy(this.show, this));
		addon.on('click.clockpicker', $.proxy(this.toggle, this));

		var tickTpl = $('<div class="clockpicker-tick">'),
			i, tick, radian;
		for (i = 0; i < 24; i += 1) {
			tick = tickTpl.clone();
			radian = i / 6 * Math.PI;
			var inner = i > 0 && i < 13,
				radius = inner ? innerRadius : outerRadius;
			tick.css({
				left: dialRadius + Math.sin(radian) * radius - tickRadius,
				top: dialRadius - Math.cos(radian) * radius - tickRadius
			});
			if (inner) {
				tick.css('font-size', '120%');
			}
			tick.html(i === 0 ? '00' : i);
			hoursView.append(tick);
			tick.on(mousedownEvent, mousedown);
		}
		for (i = 0; i < 60; i += 5) {
			tick = tickTpl.clone();
			radian = i / 30 * Math.PI;
			tick.css({
				left: dialRadius + Math.sin(radian) * outerRadius - tickRadius,
				top: dialRadius - Math.cos(radian) * outerRadius - tickRadius
			});
			tick.css('font-size', '120%');
			tick.html(leadingZero(i));
			minutesView.append(tick);
			tick.on(mousedownEvent, mousedown);
		}
		minutesView.on(mousedownEvent, function(e){
			if ($(e.target).closest('.clockpicker-tick').length === 0) {
				mousedown(e, true);
			}
		});

		function mousedown(e, notTick) {
			var offset = plate.offset(),
				isTouch = /^touch/.test(e.type),
				x0 = offset.left + dialRadius,
				y0 = offset.top + dialRadius,
				dx = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
				dy = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0,
				dr = Math.sqrt(dx * dx + dy * dy),
				notMoved = true && ! notTick;
			if (notTick && (dr < outerRadius - tickRadius || dr > outerRadius + tickRadius)) {
				return;
			}
			e.preventDefault();
			self.plate.append(self.pointer);
			self.point(dx, dy, notMoved, true);
			$doc.off(mousemoveEvent + '.clockpicker').on(mousemoveEvent + '.clockpicker', function(e){
				e.preventDefault();
				notMoved = false;
				var x = (isTouch ? e.originalEvent.touches[0] : e).pageX - x0,
					y = (isTouch ? e.originalEvent.touches[0] : e).pageY - y0;
				self.point(x, y, false, true);
			});
			$doc.off(mouseupEvent + '.clockpicker').one(mouseupEvent + '.clockpicker', function(e){
				e.preventDefault();
				var x = (isTouch ? e.originalEvent.changedTouches[0] : e).pageX - x0,
					y = (isTouch ? e.originalEvent.changedTouches[0] : e).pageY - y0;
				if (! notMoved && x === dx && y === dy) {
					self.point(x, y);
				}
				if (self.currentView === 'hours') {
					self.toggleView('minutes', duration / 2);
				} else {
					if (options.autoclose) {
						self.minutesView.addClass('clockpicker-dial-out');
						setTimeout(function(){
							self.done();
						}, duration / 2);
					}
				}
				plate.prepend(pointer);
				$doc.off(mousemoveEvent + '.clockpicker');
			});
		}

		if (svgSupported) {
			var pointer = popover.find('.clockpicker-pointer'),
				svg = createSvgElement('svg');
			svg.setAttribute('class', 'clockpicker-svg');
			svg.setAttribute('width', diameter);
			svg.setAttribute('height', diameter);
			var g = createSvgElement('g');
			g.setAttribute('transform', 'translate(' + dialRadius + ',' + dialRadius + ')');
			var bearing = createSvgElement('circle');
			bearing.setAttribute('class', 'clockpicker-pointer-bearing');
			bearing.setAttribute('cx', 0);
			bearing.setAttribute('cy', 0);
			bearing.setAttribute('r', 2);
			var needle = createSvgElement('line');
			needle.setAttribute('x1', 0);
			needle.setAttribute('y1', 0);
			var bg = createSvgElement('circle');
			bg.setAttribute('class', 'clockpicker-pointer-bg');
			bg.setAttribute('r', tickRadius);
			var fg = createSvgElement('circle');
			fg.setAttribute('class', 'clockpicker-pointer-fg');
			fg.setAttribute('r', 3.5);
			g.appendChild(needle);
			g.appendChild(bg);
			g.appendChild(fg);
			g.appendChild(bearing);
			svg.appendChild(g);
			pointer.append(svg);

			this.needle = needle;
			this.bg = bg;
			this.fg = fg;
			this.bearing = bearing;
			this.g = g;
			this.pointer = pointer;
		}
		$(document.body).append(popover);
		$(window).on('resize.clockpicker', function(){
			if (self.isShown) {
				self.locate();
			}
		});
	}
	ClockPicker.DEFAULTS = {
		placement: 'bottom',
		align: 'left',
		donetext: '完成',
		autoclose: false,
		dialRadius: 100,
		outerRadius: 80,
		innerRadius: 54,
		tickRadius: 13,
		duration: 350
	};
	ClockPicker.prototype.toggle = function(){
		this[this.isShown ? 'hide' : 'show']();
	};
	ClockPicker.prototype.locate = function(){
		var element = this.element,
			popover = this.popover,
			offset = element.offset(),
			width = element.outerWidth(),
			height = element.outerHeight(),
			placement = this.options.placement,
			align = this.options.align,
			styles = {},
			self = this;
		
		popover.show();
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
	ClockPicker.prototype.show = function(){
		if (this.isShown) {
			return;
		}

		var value = (this.input.prop('value') || '').split(':');
		this.hours = + value[0] || 0;
		this.minutes = + value[1] || 0;
		this.spanHours.html(leadingZero(this.hours));
		this.spanMinutes.html(leadingZero(this.minutes));

		this.isShown = true;
		this.toggleView('hours');
		this.locate();

		var self = this;
		$doc.on(mousedownEvent + '.clockpicker', function(e){
			var target = $(e.target);
			if (target.closest('.clockpicker-popover').length === 0 &&
					target.closest(self.addon).length === 0) {
				self.hide();
			}
		});
		$doc.on('keyup.clockpicker', function(e){
			if (e.keyCode === 27) {
				self.hide();
			}
		});
	};
	ClockPicker.prototype.hide = function(){
		this.isShown = false;
		$doc.off('click.clockpicker');
		$doc.off('keyup.clockpicker');
		this.popover.hide();
	};
	ClockPicker.prototype.toggleView = function(view, delay){
		var isHours = view === 'hours',
			showView = isHours ? this.hoursView : this.minutesView,
			hideView = isHours ? this.minutesView : this.hoursView;
		hideView.addClass('clockpicker-dial-out');
		showView.css('visibility', 'visible').removeClass('clockpicker-dial-out');
		this.currentView = view;
		this.spanHours.toggleClass('text-primary', isHours);
		this.spanMinutes.toggleClass('text-primary', ! isHours);
		this.clock(delay);
		clearTimeout(this.toggleViewTimer);
		this.toggleViewTimer = setTimeout(function(){
			hideView.css('visibility', 'hidden');
		}, this.options.duration);
	};
	ClockPicker.prototype.clock = function(delay){
		var view = this.currentView,
			value = this[view],
			isHours = view === 'hours',
			unit = Math.PI / (isHours ? 6 : 30),
			radian = value * unit,
			radius = isHours && value > 0 && value < 13 ? this.options.innerRadius : this.options.outerRadius,
			x = Math.sin(radian) * radius,
			y = - Math.cos(radian) * radius,
			self = this;
		// console.log(view, value, x, y);
		if (svgSupported && delay) {
			self.pointer.addClass('clockpicker-pointer-out');
			setTimeout(function(){
				self.pointer.removeClass('clockpicker-pointer-out');
				self.point(x, y);
			}, delay);
		} else {
			this.point(x, y);
		}
	};
	ClockPicker.prototype.point = function(x, y, notMoved, moving){
		var radian = Math.atan2(x, - y),
			isHours = this.currentView === 'hours',
			unit = Math.PI / (isHours || notMoved ? 6 : 30),
			dr = Math.sqrt(x * x + y * y),
			options = this.options,
			inner = isHours && dr < (options.outerRadius + options.innerRadius) / 2,
			radius = inner ? options.innerRadius : options.outerRadius,
			value;
		if (radian < 0) {
			radian = Math.PI * 2 + radian;
		}
		value = Math.round(radian / unit);
		radian = value * unit;
		if (isHours) {
			value = inner ? (value === 0 ? 12 : value) : value === 12 ? 0 : value + 12;
		} else {
			if (notMoved) {
				value *= 5;
			}
			if (value === 60) {
				value = 0;
			}
		}
		if (this[this.currentView] !== value) {
			if (vibrate) {
				if (! this.vibrateTimer) {
					navigator[vibrate](10);
					this.vibrateTimer = setTimeout($.proxy(function(){
						this.vibrateTimer = null;
					}, this), 100);
				}
			}
		}
		this[this.currentView] = value;
		this[isHours ? 'spanHours' : 'spanMinutes'].html(leadingZero(value));
		if (! svgSupported) {
			return;
		}
		if (moving || (! isHours && value % 5)) {
			// console.log('y');
			this.g.insertBefore(this.needle, this.bearing);
			this.g.insertBefore(this.bg, this.fg);
			this.bg.setAttribute('class', 'clockpicker-pointer-bg clockpicker-pointer-bg-trans');
		} else {
			// console.log('n');
			this.g.insertBefore(this.needle, this.bg);
			this.g.insertBefore(this.fg, this.bg);
			this.bg.setAttribute('class', 'clockpicker-pointer-bg');
		}
		var cx = Math.sin(radian) * radius,
			cy = - Math.cos(radian) * radius;
		this.needle.setAttribute('x2', cx);
		this.needle.setAttribute('y2', cy);
		this.bg.setAttribute('cx', cx);
		this.bg.setAttribute('cy', cy);
		this.fg.setAttribute('cx', cx);
		this.fg.setAttribute('cy', cy);
	};
	ClockPicker.prototype.done = function() {
		this.hide();
		var last = this.input.prop('value'),
			value = leadingZero(this.hours) + ':' + leadingZero(this.minutes);
		this.input.prop('value', value);
		if (value !== last) {
			this.input.triggerHandler('change');
			if (! this.isInput) {
				this.element.trigger('change');
			}
		}
	};

	var tpl = [
		'<div class="popover clockpicker-popover">',
			'<div class="arrow"></div>',
			'<div class="popover-title">',
				'<span class="clockpicker-span-hours text-primary"></span>',
				' : ',
				'<span class="clockpicker-span-minutes"></span>',
			'</div>',
			'<div class="popover-content">',
				'<div class="clockpicker-plate">',
					'<div class="clockpicker-pointer"></div>',
					'<div class="clockpicker-dial clockpicker-hours"></div>',
					'<div class="clockpicker-dial clockpicker-minutes clockpicker-dial-out"></div>',
				'</div>',
			'</div>',
		'</div>'
	].join('');

	$.fn.clockpicker = function(option){
		return this.each(function(){
			var $this = $(this),
				data = $this.data('clockpicker'),
				options = $.extend({}, ClockPicker.DEFAULTS, $this.data(), typeof option == 'object' && option);
			if (! data) {
				$this.data('clockpicker', new ClockPicker($this, options));
			}
		});
	};
}());
