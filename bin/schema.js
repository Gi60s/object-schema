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

/**
 * Create a schema.
 * @param schemata
 * @returns {Schema}
 * @constructor
 */
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
        value: copy(schemata, new WeakMap()),
        writable: false
    });
    
    return schema;
}

/**
 * Get all errors associated with the provided configuration.
 * @param {object} [configuration={}]
 * @returns {string[]}
 */
Schema.prototype.errors = function(configuration) {
    const doubleValidate = [];
    const errors = [];
    const schemas = this.schemas;
    const keys = Object.keys(schemas);
    const values = {};

    // if no configuration specified then initialize to empty configuration
    if (!configuration) configuration = {};
    
    // populate errors array
    keys.forEach(function(key) {
        const schemaItem = schemas[key];
        var error;
        
        // validate that required properties are given a value
        if (schemaItem.required && !configuration.hasOwnProperty(key)) {
            const help = schemaItem.help;
            error = 'Missing required configuration property: ' + key + '.' + (help ? ' ' + help : '');
            errors.push(error);

        // validate provided value
        } else if (configuration.hasOwnProperty(key)) {
            values[key] = configuration[key];
            error = schemaItem.error(values[key]);
            if (error) errors.push(error);
            
        // validate default value
        } else if (schemaItem.hasDefault) {
            values[key] = schemaItem.default;
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
            errors.push(SchemaItem.errorMessage(schemaItem.name, value, schemaItem.help));
        } else if (typeof valid === 'string') {
            errors.push(SchemaItem.errorMessage(schemaItem.name, value, valid));
        }
    });
    
    return errors;
};

/**
 * Determine if the entire configuration is valid.
 * @param {object} [configuration={}]
 * @returns {boolean}
 */
Schema.prototype.isValid = function(configuration) {
    return this.errors(configuration).length === 0;
};

/**
 * Merge default values with configuration into a new object and run it through validation before returning.
 * @property
 * @name Schema#normalize
 * @param {object} [configuration={}]
 * @returns {object}
 * @throws {Error}
 */
Schema.prototype.normalize = function(configuration) {
    if (!configuration) configuration = {};
    this.validate(configuration);

    const result = {};
    const schemas = this.schemas;
    Object.keys(schemas).forEach(function(key) {
        const schema = schemas[key];
        if (configuration.hasOwnProperty(key)) {
            result[key] = produce(schema, configuration[key]);
        } else if (schema.hasOwnProperty('default')) {
            result[key] = produce(schema, schema.default);
        }
    });

    return result;
};

/**
 * Test the configuration for validity and throws an Error if any errors are encountered.
 * @param {object} [configuration={}]
 * @throws {Error}
 */
Schema.prototype.validate = function(configuration) {
    const errors = this.errors(configuration);
    if (errors.length > 0) {
        const err = Error('Configuration has one or more errors:\n\t' + errors.join('\n\t'));
        err.code = 'ESCFG';
        throw err;
    }
};

function copy(value, map) {
    if (Array.isArray(value)) {
        if (map.has(value)) {
            return map.get(value);
        } else {
            const ar = [];
            map.set(value, ar);
            value.forEach(function (v, i) {
                ar[i] = copy(v, map);
            });
            return ar;
        }
    } else if (typeof value === 'object' && value.constructor === Object) {
        if (value === null) return null;
        if (map.has(value)) {
            return map.get(value);
        } else {
            const obj = {};
            map.set(value, obj);
            Object.keys(value).forEach(function(key) {
                obj[key] = copy(value[key], map);
            });
            return obj;
        }
    } else {
        return value;
    }
}

function produce(schema, value) {
    value = copy(value, new WeakMap());
    if (schema.transform) value = schema.transform(value);
    return value;
}