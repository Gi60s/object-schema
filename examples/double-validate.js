'use strict';
const Schema        = require('../bin/schema');

var schema = Schema({
    max: {
        help: 'Max value must be greater than min value.',
        required: true,
        type: Number, // same as 'number'
        transform: value => Math.round(value),
        validate: (value, values) => values ? value > values.min : true
    },
    min: {
        help: 'Min value must be less than max value and no less than zero.',
        required: true,
        type: 'number',
        transform: value => Math.round(value), // transform after validate
        validate: (value, values) => {
            if (!values) return value >= 0;
            return value < values.max
        }
    }
});

// valid min and max
const valid = schema.normalize({ max: 10, min: 0 });
console.log(valid);         // max: 10, Min: 0

// invalid - max less than min
try {
    schema.normalize({ max: 0, min: 10 });
} catch (e) {
    console.log(e.message);
}

// invalid - max type is incorrect
try {
    schema.normalize({ max: '5', min: 0 });
} catch (e) {
    console.log(e.message);
}