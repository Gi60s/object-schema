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

        describe('converts primitive functions to strings', function() {

            it('Boolean', function() {
                const item = SchemaItem('foo', { type: Boolean });
                expect(item.type).to.equal('boolean');
            });

            it('Function', function() {
                const item = SchemaItem('foo', { type: Function });
                expect(item.type).to.equal('function');
            });

            it('Number', function() {
                const item = SchemaItem('foo', { type: Number });
                expect(item.type).to.equal('number');
            });

            it('String', function() {
                const item = SchemaItem('foo', { type: String });
                expect(item.type).to.equal('string');
            });

            it('Symbol', function() {
                const item = SchemaItem('foo', { type: Symbol });
                expect(item.type).to.equal('symbol');
            });

            it('Object', function() {
                const item = SchemaItem('foo', { type: Object });
                expect(item.type).to.equal('object');
            });

        });
    });

    describe('validate', function() {

        it('can be a function', function() {
            SchemaItem('foo', { validate: function() {} });
        });

        it('cannot be a string', function() {
            try {
                SchemaItem('foo', { validate: 'abc' });
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

        it('validate error returns boolean', function() {
            const item = SchemaItem('foo', { validate: function() { return false } });
            expect(item.error(true).length).to.be.greaterThan(0);
        });
        
        it('validate error returns string', function() {
            const item = SchemaItem('foo', { validate: function() { return 'fail' } });
            expect(item.error(true).length).to.be.greaterThan(0);
        });

    });
    
});