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

module.exports = SchemaItem;

/**
 *
 * @param name
 * @param configuration
 * @returns {SchemaItem}
 * @constructor
 */
function SchemaItem (name, configuration) {
    const config = Object.assign({}, configuration || {});
    const schemaItem = Object.create(SchemaItem.prototype);

    // default value
    if (config.hasOwnProperty('default')) {
        if (config.required) {
            const err = Error('Invalid configuration for property: ' + name + '. Cannot make required and provide a default value.');
            err.code = 'EICONF';
            throw err;
        }
    }

    // help
    if (config.help && typeof config.help !== 'string') {
        const err = Error(SchemaItem.errorMessage('help', config.help, 'Expected a string.'));
        err.code = 'EIIPT';
        throw err;
    }
    if (!config.help) config.help = '';

    // required
    config.required = !!config.required;

    // transform
    if (config.transform && typeof config.transform !== 'function') {
        const err = Error(SchemaItem.errorMessage('transform', config.transform, 'Expected a function'));
        err.code = 'EIIPT';
        throw err;
    }

    // type
    if (config.type) {
        const types = ['boolean', 'function', 'number', 'string', 'symbol', 'object'];
        if (typeof config.type !== 'function' && types.indexOf(config.type) === -1) {
            const err = Error(SchemaItem.errorMessage('type', config.type, 'Expected a function or one of: ' + types.join(', ')));
            err.code = 'EIIPT';
            throw err;
        }
        switch (config.type) {
            case Boolean:   config.type = 'boolean';    break;
            case Function:  config.type = 'function';   break;
            case Number:    config.type = 'number';     break;
            case String:    config.type = 'string';     break;
            case Symbol:    config.type = 'symbol';     break;
            case Object:    config.type = 'object';     break;
        }
    }

    // validate
    if (config.validate && typeof config.validate !== 'function') {
        const err = Error(SchemaItem.errorMessage('validate', config.validate, 'Expected a function'));
        err.code = 'EIIPT';
        throw err;
    }

    // define properties
    Object.defineProperties(schemaItem, {

        default: {
            /**
             * @property
             * @name SchemaItem#default
             * @type {function,undefined}
             */
            value: config.default,
            writable: false
        },

        doubleValidate: {
            /**
             * @property
             * @name SchemaItem#doubleValidate
             * @type {boolean}
             */
            value: config.validate ? callbackArguments(config.validate) > 1 : false,
            writable: false
        },

        help: {
            /**
             * @property
             * @name SchemaItem#help
             * @type {string}
             */
            value: config.help,
            writable: false
        },

        name: {
            /**
             * @property
             * @name SchemaItem#name
             * @type {string}
             */
            value: name,
            writable: false
        },

        required: {
            /**
             * @property
             * @name SchemaItem#required
             * @type {boolean}
             */
            value: config.required,
            writable: false
        },

        transform: {
            /**
             * @property
             * @name SchemaItem#transform
             * @type {function}
             */
            value: config.transform,
            writable: false
        },

        type: {
            /**
             * @property
             * @name SchemaItem#type
             * @type {string,function}
             */
            value: config.type,
            writable: false
        },

        validate: {
            /**
             * @property
             * @name SchemaItem#validate
             * @type {function,undefined}
             */
            value: config.validate,
            writable: false
        }
    });

    return schemaItem;
}

/**
 * Get details about any errors associated with the value provided.
 * @param {*} value
 * @returns {string}
 */
SchemaItem.prototype.error = function(value) {
    const type = this.type;

    // validate the type of the value
    if (type && !(typeof type === 'string' && typeof value === type) && !(type instanceof Function && value instanceof type)) {
        const expects = 'Invalid type. ' +
            (typeof type === 'string'
                ? 'Expected a ' + type
                : 'Expected an instance of ' + type.name) +
            '.';
        const actual = value instanceof Object ? 'an instance of ' + value.constructor.name : value;
        return SchemaItem.errorMessage(this.name, actual, expects);
    }

    if (this.validate) {
        const valid = this.validate(value);
        if (valid === false) return SchemaItem.errorMessage(this.name, value, this.help);
        if (typeof valid === 'string') return SchemaItem.errorMessage(this.name, value, valid);
    }

    return '';
};

SchemaItem.errorMessage = function(property, actual, expected) {
    var result = 'Invalid configuration value for property: ' + property + '.';
    if (expected) result += ' ' + expected;
    if (arguments.length > 1) result += ' Received: ' + actual;
    return result;
};



/**
 * Figure out how many arguments a function definition.
 * @param {function} callback
 * @returns {number}
 */
function callbackArguments(callback) {
    const rx = /^(?:function)?\s?(?:\(([\s\S]*?)\)|([\s\S]*?)\s*=>)/;
    const match = rx.exec(callback.toString());

    var args = typeof match[1] === 'string' ? match[1] : match[2];
    if (/^\([\s\S]*?\)$/.test(args)) args = args.substring(1, args.length - 1);
    args = args.split(/,\s?/).filter(function(v) { return v.length > 0 });

    return args.length;
}