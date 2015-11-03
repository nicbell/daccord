D’accord
======
Kickoff validation plugin for forms. Uses HTML 5 form attributes to trigger validation tests.

Usage
---
```js
var Daccord = require('daccord-validation');
new Daccord(document.querySelector('form'));
```
```html
<form class="l-container" action="/somewhere">
	<div class="form-controlGroup">
		<label class="form-label" for="field1">Text, required, maxlength 10</label>
		<input class="form-input" id="field1" name="field1" type="text" required maxlength="10">
	</div>
	<div class="form-controlGroup">
		<label class="form-label" for="field2">Email, required</label>
		<input class="form-input" id="field2" name="field2" type="email" required>
	</div>
	<div class="form-controlGroup">
		<label class="form-label" for="field3">Text, required with message</label>
		<input class="form-input" id="field3" name="field3" type="text" data-val-required="This field is required" required>
		<div class="form-message"></div>
	</div>
	<button class="btn btn--primary" type="submit">Submit</button>
</form>
```
Error messages are shown if there is an element with the class of ```form-controlGroup-message``` in the same ```form-controlGroup``` as the input field.

```form-controlGroup--error``` and ```form-controlGroup--success``` are added to the ```form-controlGroup``` to indicate success or failure.

API
---

| Rule | Triggered by | Error message  |
--- | --- | ---
| Required field | ```required``` or ```data-val-required``` attribute | ```data-val-required="Message"``` |
| Max length | ```maxlength="num"``` or ```data-val-length-max="num"``` | ```data-val-length="Message"``` |
| Min length | ```minlength="num"``` or ```data-val-length-min="num"``` | ```data-val-length="Message"``` |
| Pattern | ```pattern="regex"``` or ```data-val-regex-pattern="regex"``` | ```data-val-regex="Message"``` |
| Email | ```type="email"``` | ```data-val-email="Message"``` |
| Matches | ```data-val-equalto-other="name of other"``` | ```data-val-equalto="Message"``` |
