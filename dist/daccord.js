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
