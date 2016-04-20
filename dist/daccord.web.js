(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Daccord = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
/**
 * Closest helper
 */
function closest(elem, selector) {
    var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
    while (elem) {
        if (matchesSelector.bind(elem)(selector)) {
            return elem;
        }
        else {
            elem = elem.parentElement;
        }
    }
    return null;
}
module.exports = closest;

},{}],2:[function(require,module,exports){
/// <reference path="../typings/tsd.d.ts" />
"use strict";
/** Node module requires */
var objectAssign = require('object-assign');
/** TypeScript imports */
var closest = require('./closest');
var validationTests = require('./validationtests');
/**
 * Daccord class
 */
var Daccord = (function () {
    function Daccord(element, options) {
        /** Default values for options */
        this.options = {
            fields: 'input, select, textarea',
            inlineErrors: false,
            errorClass: 'has-error',
            successClass: 'has-success',
            focus: false,
            liveValidation: false
        };
        this.element = element;
        this.options = objectAssign({}, this.options, options || {});
        this.fields = this.element.querySelectorAll(this.options.fields);
        // Disable native validation before attaching ours
        this.element.setAttribute('novalidate', 'true');
        this.addEvents();
    }
    Daccord.prototype.addEvents = function () {
        // Validate everything on submit
        this.element.querySelector('[type=submit]').addEventListener('click', this.validateAll.bind(this));
        // Validation on edit
        for (var i = 0; i < this.fields.length; i++) {
            // Force numeric input
            if (this.fields[i].getAttribute('type') === 'range' || this.fields[i].getAttribute('type') === 'number') {
                this.fields[i].addEventListener('keyup', function () {
                    if (/[\D]/.test(this.value))
                        this.value = this.value.replace(/[^\0-9]/ig, '');
                });
            }
            // Validate field on blur
            this.fields[i].addEventListener('blur', function (e) {
                this.validateInput(e.target);
            }.bind(this));
            // Remove error state on focus
            this.fields[i].addEventListener('focus', function (e) {
                var controlGroup = closest(e.target, '.form-controlGroup');
                controlGroup.classList.remove(this.options.errorClass);
                controlGroup.classList.remove(this.options.successClass);
            }.bind(this));
            if (this.options.liveValidation) {
                this.fields[i].addEventListener('keyup', function (e) {
                    this.validateInput(e.target);
                }.bind(this));
            }
        }
    };
    Daccord.prototype.validateInput = function (field) {
        var isValid = true, controlGroup = closest(field, '.form-controlGroup'), controlGroupMessage = controlGroup.querySelector('.form-message'), hasError = controlGroup.classList.contains(this.options.errorClass), errorMessage, testResult;
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
            for (var index = 0; index < validationTests.length; index++) {
                var test = validationTests[index];
                doTest(test, field);
            }
            // Messaging
            controlGroup.classList.remove(this.options.errorClass);
            controlGroup.classList.remove(this.options.successClass);
            controlGroup.classList.add((hasError || !isValid) ? this.options.errorClass : this.options.successClass);
            if (this.options.inlineErrors) {
                field.value = '';
                field.setAttribute('placeholder', errorMessage);
            }
            if (controlGroupMessage) {
                var message = isValid ? '' : errorMessage;
                if (controlGroupMessage.textContent !== undefined)
                    controlGroupMessage.textContent = message;
                else
                    controlGroupMessage['innerText'] = message;
            }
        }
        return isValid;
    };
    Daccord.prototype.validateAll = function (e) {
        var isValid = true, isFocused = false;
        for (var i = 0; i < this.fields.length; i++) {
            if (!this.validateInput(this.fields[i])) {
                isValid = false;
                if (this.options.focus && !isFocused) {
                    this.fields[i].focus();
                    isFocused = true;
                }
            }
        }
        if (e) {
            e.preventDefault();
        }
        return isValid;
    };
    return Daccord;
}());
module.exports = Daccord;

},{"./closest":1,"./validationtests":3,"object-assign":4}],3:[function(require,module,exports){
"use strict";
/**
 * Tests
 */
var validationTests = [
    {
        name: 'required',
        condition: function (field) { return field.hasAttribute('required') || field.hasAttribute('data-val-required'); },
        test: function (field) {
            // Required checkbox & radio, 1 should be checked.
            if (field.getAttribute('type') === 'radio' || field.getAttribute('type') === 'checkbox') {
                return document.querySelectorAll('input[name="' + field.getAttribute('name') + '"]:checked').length === 1;
            }
            return field.value.length > 0;
        },
        errorMessage: 'val-required'
    },
    {
        name: 'maxlength',
        condition: function (field) { return field.hasAttribute('maxlength') || field.hasAttribute('data-val-length-max'); },
        test: function (field) {
            return field.value.length <= parseInt(field.getAttribute('maxlength') || field.getAttribute('data-val-length-max'), 10);
        },
        errorMessage: 'val-length'
    },
    {
        name: 'minlength',
        condition: function (field) { return field.hasAttribute('minlength') || field.hasAttribute('data-val-length-min'); },
        test: function (field) {
            return field.value.length >= parseInt(field.getAttribute('minlength') || field.getAttribute('data-val-length-min'), 10);
        },
        errorMessage: 'val-length'
    },
    {
        name: 'pattern',
        condition: function (field) { return field.hasAttribute('pattern') || field.hasAttribute('data-val-regex-pattern'); },
        test: function (field) {
            return new RegExp(field.getAttribute('pattern') || field.getAttribute('data-val-regex-pattern')).test(field.value);
        },
        errorMessage: 'val-regex'
    },
    {
        name: 'email',
        condition: function (field) { return field.getAttribute('type') === 'email'; },
        test: function (field) {
            return /^[a-zA-Z0-9.!#$%&’*+\/=?\^_`{|}~\-]+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)*$/.test(field.value);
        },
        errorMessage: 'val-email'
    },
    {
        name: 'matches',
        condition: function (field) { return field.hasAttribute('data-val-equalto-other'); },
        test: function (field) {
            return field.value === document.querySelector('input[name=' + field.getAttribute('data-val-equalto-other').replace('*.', '') + ']').value;
        },
        errorMessage: 'val-equalto'
    }
];
module.exports = validationTests;

},{}],4:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}]},{},[2])(2)
});