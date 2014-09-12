/* global module, test, ok, strictEqual */

module('DATA-API');

test('data-default="20:48" on input', function(){
    var input = $('<input data-default="20:48" />')
                .appendTo('#qunit-fixture');

    input.clockpicker();
    var picker = input.data('clockpicker');
    ok(picker, 'clockpicker is initialized');

    input.triggerHandler('focus');
    strictEqual(picker.hours, 20, 'hours is setted by default');
    strictEqual(picker.minutes, 48, 'minutes is setted by default');

    picker.hide();
    input.blur()
         .val('10:24')
         .triggerHandler('focus');
    strictEqual(picker.hours, 10, 'hours changed');
    strictEqual(picker.minutes, 24, 'minutes changed');

    picker.hide();
    input.blur()
         .val('')
         .triggerHandler('focus');
    strictEqual(picker.hours, 20, 'hours reset');
    strictEqual(picker.minutes, 48, 'minutes reset');
});

test('data-default="20:48" on input-group', function(){
    var group = $('<div class="input-group" data-default="20:48"><input /></div>')
                .appendTo('#qunit-fixture');
    var input = group.find('input');

    group.clockpicker();
    var picker = group.data('clockpicker');
    ok(picker, 'clockpicker is initialized');

    input.triggerHandler('focus');
    strictEqual(picker.hours, 20, 'hours is setted by default');
    strictEqual(picker.minutes, 48, 'minutes is setted by default');

    picker.hide();
    input.blur()
         .val('10:24')
         .triggerHandler('focus');
    strictEqual(picker.hours, 10, 'hours changed');
    strictEqual(picker.minutes, 24, 'minutes changed');

    picker.hide();
    input.blur()
         .val('')
         .triggerHandler('focus');
    strictEqual(picker.hours, 20, 'hours reset');
    strictEqual(picker.minutes, 48, 'minutes reset');
});

test('data-placement="bottom|left|right|top" on input', function(){
    var input, picker;

    input = $('<input />')
                .appendTo('#qunit-fixture');
    input.clockpicker();
    picker = input.data('clockpicker');
    ok(picker, 'clockpicker is initialized');
    input.triggerHandler('focus');
    ok(picker.popover.hasClass('bottom'), 'place at bottom by default');
    input.remove();

    var placements = ["bottom", "left", "right", "top"];
    var aligns = ["left", "bottom", "top", "right"];
    for (var i = 0; i < placements.length; i += 1) {
        var place = placements[i];
        var align = aligns[i];
        input = $('<input data-placement="' + place + '" data-align="' + align + '" />')
                    .appendTo('#qunit-fixture');
        input.clockpicker();
        picker = input.data('clockpicker');
        ok(picker, 'clockpicker is initialized');
        input.triggerHandler('focus');
        ok(picker.popover.hasClass(place), 'place at ' + place);
        input.remove();
    }
});

test('data-align="bottom|left|right|top" on input', function(){
    var input, picker;

    input = $('<input />')
                .appendTo('#qunit-fixture');
    input.clockpicker();
    picker = input.data('clockpicker');
    ok(picker, 'clockpicker is initialized');
    input.triggerHandler('focus');
    ok(picker.popover.hasClass('clockpicker-align-left'), 'place at left by default');
    input.remove();

    var aligns = ["bottom", "left", "right", "top"];
    var placements = ["left", "bottom", "top", "right"];
    for (var i = 0; i < aligns.length; i += 1) {
        var align = aligns[i];
        var place = placements[i];
        input = $('<input data-align="' + align + '" data-placement="' + place + '" />')
                    .appendTo('#qunit-fixture');
        input.clockpicker();
        picker = input.data('clockpicker');
        ok(picker, 'clockpicker is initialized');
        input.triggerHandler('focus');
        ok(picker.popover.hasClass('clockpicker-align-' + align), 'align at ' + align);
        input.remove();
    }
});
