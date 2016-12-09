'use strict';
const Schema        = require('../bin/schema');

const schema = Schema({

    // array without schema
    array: {
        help: 'Must be a non-empty array.',
        type: Array,
        required: true,
        validate: v => v.length > 0
    },

    // array with schema of numbers
    numbers: {
        help: 'Must be an array of numbers.',
        type: Array,
        items: { type: 'number' }
    },

    // array with
    objects: {
        help: 'Must be an array of objects with properties: name, age.',
        type: Array,
        items: {
            type: Object,
            schema: {
                name: {
                    type: 'string',
                    required: true
                },
                age: {
                    type: 'number'
                }
            }
        }
    }
});