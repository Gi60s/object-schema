"use strict";
const expect        = require('chai').expect;
const SchemaItem    = require('../bin/schema-item');

describe('schema-item', function() {

    it('does not require any options', function() {
        SchemaItem('foo');
    });
    
    it('cannot have default and required', function() {
        try {
            SchemaItem('foo', { default: 0, required: true });
            throw Error('Should not get here.');
        } catch (e) {
            expect(e.code).to.equal('EICONF');
        }
    });

    describe('help', function() {

        it('can be a string', function() {
            SchemaItem('foo', { help: 'hello' });
        });

        it('can not be a function', function() {
            try {
                SchemaItem('foo', { help: function() {} });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        })
    });

    describe('transform', function() {

        it('can be a function', function() {
            SchemaItem('foo', { transform: function() {} });
        });

        it('can not be a string', function() {
            try {
                SchemaItem('foo', { transform: 'hello' });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        })
    });

    describe('type', function() {

        it('can be a function', function() {
            SchemaItem('foo', { type: function() {} });
        });

        it('can be a string matching typeof possibilities', function() {
            SchemaItem('foo', { type: 'number' });
        });

        it('cannot be an arbitrary string', function() {
            try {
                SchemaItem('foo', { type: 'abc' });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        });
    });

    describe('validate', function() {

        it('can be a function', function() {
            SchemaItem('foo', { type: function() {} });
        });

        it('cannot be a string', function() {
            try {
                SchemaItem('foo', { type: 'abc' });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        });
    });

    describe('#error', function() {

        it('no errors', function() {
            const item = SchemaItem('foo', {});
            expect(item.error({ x: true })).to.equal('');
        });

        it('type error', function() {
            const item = SchemaItem('foo', { type: Number });
            expect(item.error(true).length).to.be.greaterThan(0);
        });

        it('validate error', function() {
            const item = SchemaItem('foo', { validate: function() { return false } });
            expect(item.error(true).length).to.be.greaterThan(0);
        });

    });
    
});