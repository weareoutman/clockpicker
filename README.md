# ClockPicker [![Bower version](https://badge.fury.io/bo/clockpicker.svg)](http://badge.fury.io/bo/clockpicker) [![Build Status](https://travis-ci.org/weareoutman/clockpicker.svg)](https://travis-ci.org/weareoutman/clockpicker)  [![devDependency Status](https://david-dm.org/weareoutman/clockpicker/dev-status.svg)](https://david-dm.org/weareoutman/clockpicker#info=devDependencies)

A clock-style timepicker for Bootstrap 4 (or Bootstrap 3 or jQuery).

[Light documentation and examples for Bootstrap 4](https://jsfiddle.net/djibe89/9wj67d5u/).

[Original documentation and examples for Bootstrap 3](http://weareoutman.github.io/clockpicker/).

Below are the screens for Bootstrap 4 and Bootstrap 4 with Daemonite material UI

![Bootstrap 4 clockpicker](assets/images/clockpicker-bs4.png?raw=true "Clockpicker for Bootstrap 4")
![Bootstrap 4 clockpicker](assets/images/clockpicker-bs4-material.png?raw=true "Clockpicker for Bootstrap 4 with material design")

And the original screens from Weareoutman for Bootstrap 3

![Screenshot](http://weareoutman.github.io/clockpicker/assets/images/screenshot-1.png)
![clockpicker-12-hour-screenshot](https://cloud.githubusercontent.com/assets/5218249/3613434/03da9888-0db8-11e4-8bdb-dbabb5e91e5c.png)
## Browser support

All major browsers are supported, including IE 9+. It should look and behave well enough in IE 8.

## Device support

Both desktop and mobile device are supported. It also works great in touch screen device.

## Dependencies

ClockPicker was designed for Bootstrap in the beginning. So Bootstrap (3 or 4 and jQuery) is the only dependency(s).

Since it only used `.popover` and some of `.btn` styles of Bootstrap, I picked these styles to build a jQuery plugin.
Feel free to use `jquery-*` files instead of `bootstrap-*` , for non-bootstrap project.

## Usage

```html
<!-- Bootstrap stylesheet -->
<link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">

<!-- ClockPicker Stylesheet -->
<link rel="stylesheet" type="text/css" href="dist/bootstrap-clockpicker.min.css">

<!-- Input group, just add class 'clockpicker', and optional data-* -->
<div class="input-group clockpicker" data-placement="right" data-align="top" data-autoclose="true">
	<input type="text" class="form-control" value="09:32">
	<span class="input-group-addon">
		<span class="glyphicon glyphicon-time"></span>
	</span>
</div>

<!-- Or just a input -->
<input id="demo-input" />

<!-- jQuery and Bootstrap scripts -->
<script type="text/javascript" src="assets/js/jquery.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>

<!-- ClockPicker script -->
<script type="text/javascript" src="dist/bootstrap-clockpicker.min.js"></script>

<script type="text/javascript">
$('.clockpicker').clockpicker()
	.find('input').change(function(){
		// TODO: time changed
		console.log(this.value);
	});
$('#demo-input').clockpicker({
	autoclose: true
});

if (something) {
	// Manual operations (after clockpicker is initialized).
	$('#demo-input').clockpicker('show') // Or hide, remove ...
			.clockpicker('toggleView', 'minutes');
}
</script>
```

## Options

| Name | Default | Description |
| ---- | ------- | ----------- |
| default | '' | default time, 'now' or '13:14' e.g. |
| placement | 'bottom' | popover placement |
| align | 'left' | popover arrow align |
| donetext | 'OK' ('完成' in BS3) | done button text |
| autoclose | false | auto close when minute is selected |
| twelvehour | false | enables twelve hour mode with AM & PM buttons |
| vibrate | true | vibrate the device when dragging clock hand |
| fromnow | 0 | set default time to * milliseconds from now (using with default = 'now') |
| init | | callback function triggered after the colorpicker has been initiated |
| beforeShow | | callback function triggered before popup is shown |
| afterShow | | callback function triggered after popup is shown |
| beforeHide | | callback function triggered before popup is hidden Note:will be triggered between a beforeDone and afterDone |
| afterHide | | callback function triggered after popup is hidden Note:will be triggered between a beforeDone and afterDone |
| beforeHourSelect | | callback function triggered before user makes an hour selection |
| afterHourSelect | | callback function triggered after user makes an hour selection |
| beforeDone | | callback function triggered before time is written to input |
| afterDone | | callback function triggered after time is written to input |

## Operations

| operation | Arguments | Description |
| --------- | --------- | ----------- |
| show |   | show the clockpicker |
| hide |   | hide the clockpicker |
| remove |   | remove the clockpicker (and event listeners) |
| toggleView | 'hours' or 'minutes' | toggle to hours or minutes view |

## What's included

```bash
clockpicker/
├── dist/
│   ├── bootstrap-clockpicker.css      # full code for bootstrap 3
│   ├── bootstrap-clockpicker.js
│   ├── bootstrap-clockpicker.min.css  # compiled and minified files for bootstrap 3
│   ├── bootstrap-clockpicker.min.js
|   |── bootstrap4-clockpicker.css      # full code for bootstrap 4
│   ├── bootstrap4-clockpicker.js
│   ├── bootstrap4-clockpicker.min.css  # compiled and minified files for bootstrap 4
│   ├── bootstrap4-clockpicker.min.js
│   ├── jquery-clockpicker.css         # full code for jquery
│   ├── jquery-clockpicker.js
│   ├── jquery-clockpicker.min.css     # compiled and minified files for jquery
│   └── jquery-clockpicker.min.js
└── src/                               # source code
    ├── clockpicker.css
    ├── clockpicker.js
    └── standalone.css                 # some styles picked from bootstrap
```

## Development

```bash
git clone https://github.com/weareoutman/clockpicker.git
cd clockpicker
npm install -g gulp
npm install
gulp
# gulp test
```

## Todo

- [ ] Auto placement and align.
- [ ] Events.
- [ ] Customize format.
- [ ] Seconds View ?

## Change log
0.2.3

* [Poradz : Prevented the popover position from overflowing outside the window](https://github.com/djibe/clockpicker/commit/191ca92ae612bf6cec4c9981e3704d9d482e0ad9).
* [Poradz : Parsing input value in getTime function broke picked value when beforeHide or beforeDone callbacks were in use]( https://github.com/djibe/clockpicker/pull/2/commits/204417a37ad02f0f7581907368a3d0c03af865a7).

0.2.2

* phanku : Fixed clock picker so the clock picker will work when the trigger element is within a modal
* SCSS source file added for easier maintenance
* Minor CSS tweaks
*  fallback added for a Bootstrap free use (ex: background-color: var(--primary, #007bff);)

0.2.1

* moved AM-PM buttons to the header and removed AM-PM block
* inverted animation for top positioned picker
* unified CSS files (compatible with BS 4.1.3, MDBootstrap 4.5.4 and Daemonite material UI)
* need help to fix cancel button

0.2

* migrated all classes to BS4
* enhenced material design
* added popover opening animation
* added Cancel button (doesn't work right now :( )
* prevent user-select on all elements
* next version : move AM and PM buttons in popover-header, fix cancel button

0.1

* Bootstrap 4 compatible (tested with BS 4.1.1)
* Universal theming using CSS variables

0.0.7

* Enables twelve hour mode with AM & PM buttons.

0.0.6

* Default time can be setted to `now`.
* Registered as a bower package.

0.0.5

* Functional operations.

## License

MIT
