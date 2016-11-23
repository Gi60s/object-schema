/**
 *  @license
 *    Copyright 2016 Brigham Young University
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 **/
'use strict';
const SchemaItem            = require('./schema-item');

module.exports = Schema;

function Schema (schemata) {
    const schema = Object.create(Schema.prototype);
    const data = {};
        
    Object.keys(schemata)
        .forEach(function(key) {
            data[key] = SchemaItem(key, schemata[key]);
        });

    /**
     * @property
     * @name Schema#schemas
     * @type {Object<string,SchemaItem>}
     */
    Object.defineProperty(schema, 'schemas', {
        value: data,
        writable: false
    });

    /**
     * @property
     * @name Schema#configuration
     * @type {object}
     */
    Object.defineProperty(schema, 'configuration', {
        value: Object.assign({}, config),
        writable: false
    });
    
    return schema;
}

/**
 * Get all errors associated with the provided configuration.
 * @param {object} configuration
 * @returns {string[]}
 */
Schema.prototype.errors = function(configuration) {
    const doubleValidate = [];
    const errors = [];
    const schemas = this.schemas;
    const keys = Object.keys(schemas);
    const values = {};
    
    // populate errors array
    keys.forEach(function(key) {
        const schemaItem = schemas[key];
        var error;
        
        // validate that required properties are given a value
        if (schemaItem.required && !configuration.hasOwnProperty(key)) {
            const help = schemaItem.help();
            error = 'Missing required configuration property: ' + key + '.' + (help ? ' ' + help : '');
            errors.push(error);
            
        // validate value
        } else {
            values[key] = configuration.hasOwnProperty(key) ? configuration[key] : schemaItem.default;
            error = schemaItem.error(values[key]);
            if (error) errors.push(error);
        }
        
        // if it needs double validation then store it's key
        if (!error && schemaItem.doubleValidate) doubleValidate.push(key);
    });
    
    // run secondary validation
    doubleValidate.forEach(function(key) {
        const schemaItem = schemas[key];
        const value = values[key];
        const valid = schemaItem.validate(value, values);

        if (valid === false) {
            errors.push(SchemaItem.errorMessage(schemaItem.name, value, schemaItem.help(value)));
        } else if (typeof valid === 'string') {
            errors.push(SchemaItem.errorMessage(schemaItem.name, value, valid));
        }
    });
    
    return errors;
};

/**
 * Determine if the entire configuration is valid.
 * @param {object} configuration
 * @returns {boolean}
 */
Schema.prototype.isValid = function(configuration) {
    return this.errors(configuration).length === 0;
};

/**
 * Merge default values with configuration into a new object and run it through validation before returning.
 * @param {object} configuration
 * @returns {object}
 * @throws {Error}
 */
Schema.prototype.normalize = function(configuration) {
    this.validate(configuration);

    // populate errors array
    Object.keys(data)
        .forEach(function(key) {
            const schemaItem = data[key];

            // validate that required properties are given a value
            if (schemaItem.required && !configuration.hasOwnProperty(key)) {
                const help = schemaItem.help();
                errors.push('Missing required configuration property: ' + key + '.' + (help ? ' ' + help : ''));
            }

            const value = configuration.hasOwnProperty(key) ? configuration[key] : schemaItem.default;
            const error = schemaItem.error(value);
            if (error) errors.push(error);
        });
};

/**
 * Test the configuration for validity and throw any errors encountered.
 * @param {object} configuration
 * @throws {Error}
 */
Schema.prototype.validate = function(configuration) {
    const errors = this.errors(configuration);
    if (errors.length > 0) throw Error('Configuration has one or more errors:\n\t' + errors.join('\n\t'));
};

