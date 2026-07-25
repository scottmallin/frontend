const test = require('node:test')
const { RuleTester } = require('eslint')
const vueParser = require('vue-eslint-parser')
const rule = require('../rules/registry-only-props')

RuleTester.describe = test.describe
RuleTester.it = test.it

const ruleTester = new RuleTester({
  languageOptions: {
    parser: vueParser,
    ecmaVersion: 2022,
    sourceType: 'module',
  },
})

const sfc = (template) => `<template>${template}</template>`

ruleTester.run('registry-only-props', rule, {
  valid: [
    // Registered props, valid enum values.
    sfc('<Button variant="primary" size="md" />'),
    sfc('<Card elevation="raised" />'),
    sfc('<Badge variant="success">ok</Badge>'),
    // Directives, events, and globals are not props — must be ignored.
    sfc('<Button variant="secondary" :disabled="isDisabled" class="foo" @click="go" v-if="show" />'),
    sfc('<Button variant="danger" data-test="x" aria-label="y" id="q" />'),
    // Dynamic bind: name is registered, value is unknowable → not flagged.
    sfc('<Button :variant="intent" />'),
    // v-bind spread has no argument → ignored.
    sfc('<Button v-bind="attrs" />'),
    // Native/unregistered elements are out of scope.
    sfc('<div foo="bar" />'),
    sfc('<input placeholder="native" />'),
  ],
  invalid: [
    {
      code: sfc('<Button foo="bar" />'),
      errors: [{ messageId: 'unregisteredProp', data: { prop: 'foo', component: 'Button' } }],
    },
    {
      code: sfc('<Button variant="ghost" />'),
      errors: [{ messageId: 'invalidEnumValue' }],
    },
    {
      // Static value via a bound literal is validated too.
      code: sfc("<Button :variant=\"'ghost'\" />"),
      errors: [{ messageId: 'invalidEnumValue' }],
    },
    {
      code: sfc('<Button size="xl" />'),
      errors: [{ messageId: 'invalidEnumValue' }],
    },
    {
      code: sfc('<Card elevation="floating" />'),
      errors: [{ messageId: 'invalidEnumValue' }],
    },
    {
      code: sfc('<Badge variant="loud" />'),
      errors: [{ messageId: 'invalidEnumValue' }],
    },
    {
      // Unregistered prop AND out-of-range enum in one element → two reports.
      code: sfc('<Button variant="ghost" bogus="1" />'),
      errors: [{ messageId: 'invalidEnumValue' }, { messageId: 'unregisteredProp' }],
    },
  ],
})
