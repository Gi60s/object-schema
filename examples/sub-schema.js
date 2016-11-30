'use strict';
const Schema        = require('../bin/schema');

//define the person schema
const personSchema = Schema({
    age: {
        default: 0,
        help: 'This must be a non-negative number.',
        transform: function(value) {
            return Math.round(value);
        },
        validate: function(value) {
            return !isNaN(value) && value >= 0;
        }
    },
    name: {
        help: 'This must be a non-empty string.',
        required: true,
        validate: function(value) {
            return typeof value === 'string' && value && true;
        }
    }
});

const schema = Schema({
    id: {
        type: String
    },
    person: {
        required: true,
        schema: personSchema
    },
    pet: {
        schema: {
            name: {
                type: String,
                required: true
            },
            type: {
                type: String
            }
        }
    },
    relatives: {
        type: Array,
        schema: personSchema
    }
});


const config = {
    id: 'abc123',
    person: {
        name: 'Bob',
        age: 51
    },
    relatives: [
        { name: 'Bob Jr.', age: 15, birthOrder: 1 },
        { name: 'Marcy', age: 12 },
        { name: 'Jane' }
    ]
};
const value = schema.normalize(config);
console.log(value);