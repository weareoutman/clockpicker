module('BASIC');

test('clockpicker on input', function(){
    var input = $('<input />')
                .appendTo('#qunit-fixture');

    input.clockpicker();
    var picker = input.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input');

    input.focus();
    strictEqual(picker.isShown, true, 'clockpicker is shown');

    $(document.body).click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden');

    input.remove();
});

test('clockpicker on input-group', function(){
    var group = $('<div class="input-group" data-default="20:48"><input /></div>')
                .appendTo('#qunit-fixture');
    var input = group.find('input');

    group.clockpicker();
    var picker = group.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input-group');

    input.focus();
    strictEqual(picker.isShown, true, 'clockpicker is shown');

    $(document.body).click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden');

    group.remove();
});

test('clockpicker on input-group with addon', function(){
    var group = $('<div class="input-group" data-default="20:48"><input /><span class="input-group-addon">addon</span></div>')
                .appendTo('#qunit-fixture');
    var input = group.find('input');
    var addon = group.find('.input-group-addon');

    group.clockpicker();
    var picker = group.data('clockpicker');
    ok(picker, 'clockpicker is initialized on input-group');

    input.focus();
    strictEqual(picker.isShown, true, 'clockpicker is shown by focus');

    $(document.body).click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden by click on body');

    addon.click();
    strictEqual(picker.isShown, true, 'clockpicker is shown by click on addon');

    addon.click();
    strictEqual(picker.isShown, false, 'clockpicker is hidden by click on addon again');

    group.remove();
});
