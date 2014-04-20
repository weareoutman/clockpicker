# Bootstrap Clock-Style TimePicker

A android-like clock-style timepicker for Bootstrap.
[Documentation and examples](http://weareoutman.github.io/clockpicker/).

![Screenshot](http://weareoutman.github.io/clockpicker/images/screenshot-1.png)

## Browser and device support

We support all major browsers, including IE 9+, in destop and mobile device. It should look and behave well enough in IE 8.

## Usage

```html
<!-- Bootstrap stylesheet -->
<link rel="stylesheet" type="text/css" href="css/bootstrap.min.css">

<!-- ClockPicker Stylesheet -->
<link rel="stylesheet" type="text/css" href="src/bootstrap-clockpicker.css">

<!-- Input group, just add class 'clockpicker', and optional data-* -->
<div class="input-group clockpicker" data-placement="right" data-align="top" data-autoclose="true">
	<input type="text" class="form-control" value="09:32">
	<span class="input-group-addon">
		<span class="glyphicon glyphicon-time"></span>
	</span>
</div>

<!-- jQuery and Bootstrap scripts -->
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/bootstrap.min.js"></script>

<!-- ClockPicker script -->
<script type="text/javascript" src="src/bootstrap-clockpicker.js"></script>

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

## Todo

- [ ] Compiling CSS and JavaScript.
- [ ] Add documentation and more examples.
- [ ] Customize format.
- [ ] Seconds View ?
- [ ] Comments in code.
- [ ] Add tests.

## License

MIT
