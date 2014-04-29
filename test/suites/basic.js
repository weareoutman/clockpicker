/* global module, test, ok, strictEqual */

module('BASIC');

test('clockpicker on input', function(){
    var input = $('<input />')
                .appendTo('#qunit-fixture');

    // Initialize
    input.clockpicker();
    var picker = input.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input');
    ok(! picker.isAppended, 'clockpicker is not appended to body when initialized');

    // First shown
    // Using triggerHandler('focus') instead of focus(), since invisible element can not be focused in IE.
    input.triggerHandler('focus');
    ok(picker.isShown, 'clockpicker is shown');
    ok(picker.isAppended, 'clockpicker is appended to body before first shown');

    // Ticks
    var hours = picker.hoursView.find('.clockpicker-tick'),
        minutes = picker.minutesView.find('.clockpicker-tick');
    strictEqual(hours.length, 24, '24 hour ticks');
    strictEqual(minutes.length, 12, '12 minute ticks');

    // Toggle views, set hours and minutes
    strictEqual(picker.currentView, 'hours', 'first view is hours');
    strictEqual(picker.hours, 0, 'hours is 0 by default');

    // Custom click event (mousedown, then mouseup)
    var hour1 = hours.eq(1),
        hour1Offset = hour1.offset();
    strictEqual(hour1.html(), '1', 'hour at index 1 is "1"');

    hour1.triggerHandler(CustomEvent('mousedown', {
        pageX: hour1Offset.left + 10,
        pageY: hour1Offset.top + 10
    }));

    $(document).triggerHandler(CustomEvent('mouseup', {
        pageX: hour1Offset.left + 10,
        pageY: hour1Offset.top + 10
    }));
    strictEqual(picker.hours, 1, 'hours is set to 1');

    strictEqual(picker.currentView, 'minutes', 'toggle view to minutes after hours setted');
    strictEqual(picker.minutes, 0, 'minutes is 0 by default');

    var minute5 = minutes.eq(1),
        minute5Offset = minute5.offset();
    strictEqual(minute5.html(), '05', 'minute at index 1 is "05"');

    minute5.triggerHandler(CustomEvent('mousedown', {
        pageX: minute5Offset.left + 10,
        pageY: minute5Offset.top + 10
    }));
    $(document).triggerHandler(CustomEvent('mouseup', {
        pageX: minute5Offset.left + 10,
        pageY: minute5Offset.top + 10
    }));
    strictEqual(picker.minutes, 5, 'minutes is set to 5');

    ok(picker.isShown, 'clockpicker is still shown');
    changed = 0;
    input.on('change', function(){
        changed += 1;
    });
    picker.popover.find('button').click();
    ok(! picker.isShown, 'clockpicker is hidden after clicked on done button');
    strictEqual(changed, 1, 'input triggerred a change event');
    strictEqual(input.val(), '01:05', 'input value is changed to "01:05"');

    // Click on popover should not hide
    input.triggerHandler('focus');
    ok(picker.isShown, 'clockpicker is shown again');
    picker.popover.click();
    ok(picker.isShown, 'clockpicker is not hidden when clicked on popover');

    // Hide
    $(document.body).click();
    ok(! picker.isShown, 'clockpicker is hidden');

    // Show again
    input.triggerHandler('focus');
    ok(picker.isShown, 'clockpicker is shown again');

    // Press ESC to hide
    $(document).triggerHandler($.Event('keyup', { keyCode: 27 }));
    ok(! picker.isShown, 'clockpicker is hidden when ESC is pressed');
});

test('clockpicker on input-group', function(){
    var group = $('<div class="input-group" data-default="20:48"><input /></div>')
                .appendTo('#qunit-fixture');
    var input = group.find('input');

    group.clockpicker();
    var picker = group.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input-group');
    ok(! picker.isAppended, 'clockpicker is not appended to body when initialized');

    input.triggerHandler('focus');
    ok(picker.isShown, 'clockpicker is shown');
    ok(picker.isAppended, 'clockpicker is appended to body before first shown');

    $(document.body).click();
    ok(! picker.isShown, 'clockpicker is hidden');
});

test('clockpicker on input-group with addon', function(){
    var group = $('<div class="input-group" data-default="20:48"><input /><span class="input-group-addon">addon</span></div>')
                .appendTo('#qunit-fixture');
    var input = group.find('input');
    var addon = group.find('.input-group-addon');

    group.clockpicker();
    var picker = group.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input-group');

    input.triggerHandler('focus');
    ok(picker.isShown, 'clockpicker is shown by focus');

    $(document.body).click();
    ok(! picker.isShown, 'clockpicker is hidden by click on body');

    addon.click();
    ok(picker.isShown, 'clockpicker is shown by click on addon');

    addon.click();
    ok(! picker.isShown, 'clockpicker is hidden by click on addon again');
});

test('clockpicker manual operations', function(){
    var input = $('<input />')
            .appendTo('#qunit-fixture');

    // Initialize
    input.clockpicker();
    var picker = input.data('clockpicker');
    ok(! picker.isShown, 'clockpicker is not shown');

    input.clockpicker('show');
    ok(picker.isShown, 'clockpicker is shown manually');

    strictEqual(picker.currentView, 'hours', 'current view is hours');
    input.clockpicker('toggleView', 'minutes');
    strictEqual(picker.currentView, 'minutes', 'current view is toggled to minutes');

    input.clockpicker('hide');
    ok(! picker.isShown, 'clockpicker is hidden manually');

    input.clockpicker('remove');
    ok(picker.popover.parent().length === 0, 'clockpicker popover is removed');
    ok(! input.data('clockpicker'), 'clockpicker is removed manually');
});

test('clockpicker default time is now', function(){
    var input = $('<input />')
            .appendTo('#qunit-fixture');

    input.clockpicker({
        'default': 'now'
    });
    var now = new Date();
    var picker = input.data('clockpicker');
    input.clockpicker('show');
    strictEqual(picker.hours, now.getHours(), 'hours is setted to now');
    strictEqual(picker.minutes, now.getMinutes(), 'minutes is setted to now');

    input.remove();
    input = $('<input />')
            .appendTo('#qunit-fixture');

    var fromnow = 9e4;
    input.clockpicker({
        'default': 'now',
        fromnow: fromnow
    });
    now = new Date(+ new Date() + fromnow);
    picker = input.data('clockpicker');
    input.clockpicker('show');
    strictEqual(picker.hours, now.getHours(), 'hours is setted to now');
    strictEqual(picker.minutes, now.getMinutes(), 'minutes is setted to now');
});
