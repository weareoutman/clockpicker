# ClockPicker

A android-like clock-style timepicker for Bootstrap (or jQuery).
[Documentation and examples](http://weareoutman.github.io/clockpicker/).

![Screenshot](http://weareoutman.github.io/clockpicker/assets/images/screenshot-1.png)

## Browser and device support

We support all major browsers, including IE 9+, in both destop and mobile device. It should look and behave well enough in IE 8.

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

<!-- jQuery and Bootstrap scripts -->
<script type="text/javascript" src="assets/js/jquery.min.js"></script>
<script type="text/javascript" src="assets/js/bootstrap.min.js"></script>

<!-- ClockPicker script -->
<script type="text/javascript" src="dist/bootstrap-clockpicker.min.js"></script>

<script type="text/javascript">
$(function(){
	// After dom ready
	$('.clockpicker').clockpicker()
		.find('input').change(function(){
			// TODO: time changed
			console.log(this.value);
		});
});
</script>
```

Feel free to using `jquery-*` files instead of `bootstrap-*` for no-bootstrap project.

## Todo

- [*] Compiling CSS and JavaScript.
- [ ] Add documentation and more examples.
- [ ] Customize format.
- [ ] Seconds View ?
- [*] Comments in code.
- [ ] Add tests.

## License

MIT
