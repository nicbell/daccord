var Daccord = (function () {
    function Daccord(element) {
        //Default options.
        this.options = {
            fields: 'input, select, textarea',
            inlineErrors: false,
            errorClass: 'form-controlGroup--error',
            successClass: 'form-controlGroup--success'
        };
        this.element = element;
        this.fields = this.element.querySelectorAll(this.options.fields);

        //Disable native validation before attaching ours
        this.element.setAttribute('novalidate', 'true');
        this.addEvents();
    }
    Daccord.prototype.addEvents = function () {
        //Validate everything on submit
        this.element.querySelector('[type=submit]').addEventListener('click', this.validateAll.bind(this));

        for (var i = 0; i < this.fields.length; i++) {
            //Force numeric input
            if (this.fields[i].getAttribute('type') === 'range' || this.fields[i].getAttribute('type') === 'number') {
                this.fields[i].addEventListener('keyup', function () {
                    if (/[\D]/.test(this.value))
                        this.value = this.value.replace(/[^\0-9]/ig, '');
                });
            }

            this.fields[i].addEventListener('blur', function (e) {
                this.validateInput(e.target);
            }.bind(this));

            this.fields[i].addEventListener('focus', function (e) {
                var controlGroup = closest(e.target, '.form-controlGroup');
                controlGroup.classList.remove(this.options.errorClass);
                controlGroup.classList.remove(this.options.successClass);
            }.bind(this));
        }
    };

    Daccord.prototype.validateInput = function (field) {
        var isValid = true, controlGroup = closest(field, '.form-controlGroup'), controlGroupMessage = controlGroup.querySelector('.form-controlGroup-message'), hasError = controlGroup.classList.contains(this.options.errorClass), errorMessage, testResult;

        var doTest = function (test, field) {
            if (test.condition(field)) {
                testResult = test.test(field);

                if (!testResult) {
                    var attributeName = 'data-' + test.errorMessage;
                    errorMessage = errorMessage || (field.hasAttribute(attributeName) && field.getAttribute(attributeName).length > 0 ? field.getAttribute(attributeName) : null);
                    isValid = false;
                }
            }
        };

        if (!field.hasAttribute('disabled')) {
            for (var test in Daccord.Tests) {
                if (Daccord.Tests[test]) {
                    doTest(Daccord.Tests[test], field);
                }
            }

            //Messaging
            controlGroup.classList.remove(this.options.errorClass);
            controlGroup.classList.remove(this.options.successClass);
            controlGroup.classList.add((hasError || !isValid) ? this.options.errorClass : this.options.successClass);

            if (this.options.inlineErrors) {
                field.value = '';
                field.setAttribute('placeholder', errorMessage);
            }

            if (!isValid && controlGroupMessage) {
                if (controlGroupMessage.textContent !== undefined)
                    controlGroupMessage.textContent = errorMessage;
                else
                    controlGroupMessage.innerText = errorMessage;
            }
        }

        return isValid;
    };

    Daccord.prototype.validateAll = function () {
        var isValid = true, focus = false;

        for (var i = 0; i < this.fields.length; i++) {
            if (!this.validateInput(this.fields[i])) {
                isValid = false;

                if (focus === false) {
                    this.fields[i].focus();
                    focus = true;
                }
            }
        }

        return false;
    };

    Daccord.Tests = {
        required: {
            condition: function (field) {
                return field.hasAttribute('required') || field.hasAttribute('data-val-required');
            },
            test: function (field) {
                //Required checkbox & radio, 1 should be checked.
                if (field.getAttribute('type') === 'radio' || field.getAttribute('type') === 'checkbox') {
                    return document.querySelectorAll('input[name="' + field.getAttribute('name') + '"]:checked').length === 1;
                }
                return field.value.length > 0;
            },
            errorMessage: 'val-required'
        },
        maxlength: {
            condition: function (field) {
                return field.hasAttribute('maxlength') || field.hasAttribute('data-val-length-max');
            },
            test: function (field) {
                return field.value.length <= parseInt(field.getAttribute('maxlength') || field.getAttribute('data-val-length-max'), 10);
            },
            errorMessage: 'val-length'
        },
        minlength: {
            condition: function (field) {
                return field.hasAttribute('minlength') || field.hasAttribute('data-val-length-min');
            },
            test: function (field) {
                return field.value.length >= parseInt(field.getAttribute('minlength') || field.getAttribute('data-val-length-min'), 10);
            },
            errorMessage: 'val-length'
        },
        pattern: {
            condition: function (field) {
                return field.hasAttribute('pattern') || field.hasAttribute('data-val-regex-pattern');
            },
            test: function (field) {
                return new RegExp(field.getAttribute('pattern') || field.getAttribute('data-val-regex-pattern')).test(field.value);
            },
            errorMessage: 'val-regex'
        },
        email: {
            condition: function (field) {
                return field.getAttribute('type') === 'email';
            },
            test: function (field) {
                return /^[a-zA-Z0-9.!#$%&’*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(field.value);
            },
            errorMessage: 'val-email'
        },
        matches: {
            condition: function (field) {
                return field.hasAttribute('data-val-equalto-other');
            },
            test: function (field) {
                return field.value === document.querySelector('input[name=' + field.getAttribute('data-val-equalto-other').replace('*.', '') + ']').value;
            },
            errorMessage: 'val-equalto'
        }
    };
    return Daccord;
})();

//Closest helper
function closest(elem, selector) {
    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

    while (elem) {
        if (matchesSelector.bind(elem)(selector)) {
            return elem;
        } else {
            elem = elem.parentElement;
        }
    }
    return null;
}
