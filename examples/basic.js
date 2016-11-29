'use strict';
const Schema        = require('../bin/schema');

//define the person schema
const schema = Schema({
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

// age transformation
const ageTransform = schema.normalize({ name: 'Bob', age: 12.5 });
console.log(ageTransform);      // Name: Bob, Age: 13

// default age
const defaultAge = schema.normalize({ name: 'Bob' });
console.log(defaultAge);        // Name: Bob, Age: 0

// invalid configuration - name is required
try {
    schema.normalize({})
} catch (e) {
    console.log(e.message);    // Missing required configuration property: name. This must be a non-empty string.
}

// invalid configuration - age less than zero
try {
    schema.normalize({ name: 'Bob', age: -5 });
} catch (e) {
    console.log(e.message);    // Invalid configuration value for property: age. This must be a non-negative number. Received: -5
}
