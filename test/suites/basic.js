/* global module, test, ok, strictEqual */

module('BASIC');

test('clockpicker on input', function(){
    var input = $('<input />')
                .appendTo('#qunit-fixture');

    // Initialize
    input.clockpicker();
    var picker = input.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input');
    strictEqual(picker.isAppended, false, 'clockpicker is not appended to body when initialized');

    // First shown
    // Using triggerHandler('focus') instead of focus(), since invisible element can not be focused in IE.
    input.triggerHandler('focus');
    strictEqual(picker.isShown, true, 'clockpicker is shown');
    strictEqual(picker.isAppended, true, 'clockpicker is appended to body before first shown');

    // Ticks
    var hours = picker.hoursView.find('.clockpicker-tick'),
        minutes = picker.minutesView.find('.clockpicker-tick');
    strictEqual(hours.length, 24, '24 hour ticks');
    strictEqual(minutes.length, 12, '12 minute ticks');

    // Toggle views, set hours and minutes
    strictEqual(picker.currentView, 'hours', 'first view is hours');
    strictEqual(picker.hours, 0, 'hours is 0 by default');
    // var tick = hours.eq(1),
    //     offset = tick.offset();
    // strictEqual(tick.html(), '1', 'tick at index 1 is "01"');
    // var e = $.Event('mousedown', { pageX: offset.left + 10, pageY: offset.top + 10});
    // console.log(e);
    // tick.triggerHandler('mousedown', e);
    // tick.triggerHandler('mouseup', e);
    // strictEqual(picker.hours, 1, 'hours is set to 1');
    // picker.spanMinutes.click();
    // strictEqual(picker.currentView, 'minutes', 'toggle view to minutes');
    picker.spanHours.click();
    strictEqual(picker.currentView, 'hours', 'toggle view to hours');

    // Hide
    $(document.body).click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden');

    // Click on popover should not hide
    input.triggerHandler('focus');
    strictEqual(picker.isShown, true, 'clockpicker is shown again');
    picker.popover.click();
    strictEqual(picker.isShown, true, 'clockpicker is not hidden when clicked on popover');

    // Press ESC to hide
    var e = $.Event('keyup', { keyCode: 27 });
    $(document).triggerHandler(e);
    strictEqual(picker.isShown, false, 'clockpicker is hidden when ESC is pressed');
});

test('clockpicker on input-group', function(){
    var group = $('<div class="input-group" data-default="20:48"><input /></div>')
                .appendTo('#qunit-fixture');
    var input = group.find('input');

    group.clockpicker();
    var picker = group.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input-group');
    strictEqual(picker.isAppended, false, 'clockpicker is not appended to body when initialized');

    input.triggerHandler('focus');
    strictEqual(picker.isShown, true, 'clockpicker is shown');
    strictEqual(picker.isAppended, true, 'clockpicker is appended to body before first shown');

    $(document.body).click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden');
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
    strictEqual(picker.isShown, true, 'clockpicker is shown by focus');

    $(document.body).click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden by click on body');

    addon.click();
    strictEqual(picker.isShown, true, 'clockpicker is shown by click on addon');

    addon.click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden by click on addon again');
});
