'use strict';
const Schema        = require('../bin/schema');

// constructor method
function Person(name) {
    this.name = name;
}

// factory method
function Dog(name) {
    const factory = Object.create(Dog.prototype);
    factory.name = name;
    return factory;
}

//define the person schema
const schema = Schema({
    date: {
        type: Date,
        transform: d => d.toISOString()
    },
    dog: {
        type: Dog
    },
    number: {
        type: Number
    },
    person: {
        type: Person
    },
    string: {
        type: String
    }
});

const valid = schema.normalize({
    date: new Date(),
    dog: Dog('Fido'),
    number: 5,
    person: new Person('Bob'),
    string: 'hello'
});
console.log(valid);

// invalid configuration -
try {
    schema.normalize({
        date: new Date(),
        dog: new Person('Fido'),
        number: 5,
        person: 'Bob',
        string: 'hello'
    });
} catch (e) {
    console.log(e.message);
    // Configuration has one or more errors:
    //   Invalid configuration value for property: dog. Invalid type. Expected an instance of Dog. Received: an instance of Person
    //   Invalid configuration value for property: person. Invalid type. Expected an instance of Person. Received: Bob
}