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
