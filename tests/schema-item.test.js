"use strict";
const expect        = require('chai').expect;
const SchemaItem    = require('../bin/schema-item');

describe('schema-item', () => {

    it('does not require any options', () => {
        SchemaItem('foo');
    });
    
    it('cannot have default and required', () => {
        try {
            SchemaItem('foo', { default: 0, required: true });
            throw Error('Should not get here.');
        } catch (e) {
            expect(e.code).to.equal('EICONF');
        }
    });

    describe('help', () => {

        it('can be a string', () => {
            SchemaItem('foo', { help: 'hello' });
        });

        it('can not be a function', () => {
            try {
                SchemaItem('foo', { help: () => {} });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        })
    });

    describe('transform', () => {

        it('can be a function', () => {
            SchemaItem('foo', { transform: () => {} });
        });

        it('can not be a string', () => {
            try {
                SchemaItem('foo', { transform: 'hello' });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        })
    });

    describe('type', () => {

        it('can be a function', () => {
            SchemaItem('foo', { type: () => {} });
        });

        it('can be a string matching typeof possibilities', () => {
            SchemaItem('foo', { type: 'number' });
        });

        it('cannot be an arbitrary string', () => {
            try {
                SchemaItem('foo', { type: 'abc' });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        });

        describe('converts primitive functions to strings', () => {

            it('Boolean', () => {
                const item = SchemaItem('foo', { type: Boolean });
                expect(item.type).to.equal('boolean');
            });

            it('Function', () => {
                const item = SchemaItem('foo', { type: Function });
                expect(item.type).to.equal('function');
            });

            it('Number', () => {
                const item = SchemaItem('foo', { type: Number });
                expect(item.type).to.equal('number');
            });

            it('String', () => {
                const item = SchemaItem('foo', { type: String });
                expect(item.type).to.equal('string');
            });

            it('Symbol', () => {
                const item = SchemaItem('foo', { type: Symbol });
                expect(item.type).to.equal('symbol');
            });

            it('Object', () => {
                const item = SchemaItem('foo', { type: Object });
                expect(item.type).to.equal('object');
            });

        });
    });

    describe('validate', () => {

        it('can be a function', () => {
            SchemaItem('foo', { validate: () => {} });
        });

        it('cannot be a string', () => {
            try {
                SchemaItem('foo', { validate: 'abc' });
                throw Error('Should not get here.');
            } catch (e) {
                expect(e.code).to.equal('EIIPT');
            }
        });
    });

    describe('#error', () => {

        it('no errors', () => {
            const item = SchemaItem('foo', {});
            expect(item.error({ x: true })).to.equal('');
        });

        it('type error', () => {
            const item = SchemaItem('foo', { type: Number });
            expect(item.error(true).length).to.be.greaterThan(0);
        });

        it('validate error returns boolean', () => {
            const item = SchemaItem('foo', { validate: () => { return false } });
            expect(item.error(true).length).to.be.greaterThan(0);
        });
        
        it('validate error returns string', () => {
            const item = SchemaItem('foo', { validate: () => { return 'fail' } });
            expect(item.error(true).length).to.be.greaterThan(0);
        });

    });
    
});