"use strict";
const expect        = require('chai').expect;
const Schema        = require('../index');

describe('schema', function() {

    describe('#errors', function() {

        describe('single validation', function() {

            it('valid type validation', function() {
                const schema = Schema({
                    name: { type: String }
                });
                expect(schema.errors({ name: 'Bob' }).length).to.equal(0);
            });

            it('invalid type validation', function() {
                const schema = Schema({
                    name: { type: String }
                });
                expect(schema.errors({ name: 123 }).length).to.equal(1);
            });

            it('valid validation', function() {
                const schema = Schema({
                    name: { type: String, validate: function(v) { return v.length > 0; } }
                });
                expect(schema.errors({ name: 'Bob' }).length).to.equal(0);
            });

            it('invalid validation', function() {
                const schema = Schema({
                    name: { type: String, validate: function(v) { return v.length > 0; } }
                });
                expect(schema.errors({ name: '' }).length).to.equal(1);
            });

            it('validates once', function() {
                var count = 0;
                const schema = Schema({
                    name: { type: String, validate: function(v) { count++; return v.length > 0; } }
                });
                schema.errors({ name: 'Bob' });
                expect(count).to.equal(1);
            });

        });

        describe('double validation', function() {
            var schema;
            var count;

            beforeEach(function() {
                count = 0;
                schema = Schema({
                    max: {
                        validate: function (value, values) {
                            count++;
                            return values ? value > values.min : true;
                        }
                    },
                    min: {
                        validate: function (value, values) {
                            return values ? value < values.max : true;
                        }
                    }
                });
            });

            it('valid', function() {
                expect(schema.errors({ min: 0, max: 10 }).length).to.equal(0);
            });

            it('invalid', function() {
                expect(schema.errors({ min: 10, max: 0 }).length).to.equal(2);
            });

            it('validates twice', function() {
                schema.errors({ min: 0, max: 10 });
                expect(count).to.equal(2);
            });

        });
        
        it('validates defaults', function() {
            const schema = Schema({
                num: {
                    type: Number,
                    default: 'abc'
                }
            });
            expect(schema.errors().length).to.equal(1);
        });

    });

    describe('#isValid', function() {

        it('valid', function() {
            const schema = Schema({
                name: { type: String }
            });
            expect(schema.isValid({ name: 'Bob' })).to.equal(true);
        });

        it('invalid', function() {
            const schema = Schema({
                name: { type: String }
            });
            expect(schema.isValid({ name: 123 })).to.equal(false);
        });

    });

    describe('#normalize', function() {
        
        it('throw error on validation fail', function() {
            const schema = Schema({
                name: { type: String }
            });
            expect(function() { schema.normalize({ name: 123 }) }).to.throw(Error);
        });
        
        it('fills in defaults', function() {
            const schema = Schema({
                name: { default: 'Bob' }
            });
            expect(schema.normalize().name).to.equal('Bob');
        });

        it('overwrites defaults', function() {
            const schema = Schema({
                name: { default: 'Bob' }
            });
            expect(schema.normalize({ name: 'James' }).name).to.equal('James');
        });

        it('produces a copy', function() {
            const schema = Schema({
                name: { type: String }
            });
            const config = { name: 'Tom' };
            expect(schema.normalize(config)).to.not.equal(config);
        });

        it('defaults are copies', function() {
            const def = {};
            const schema = Schema({
                name: { default: def }
            });
            expect(schema.normalize().def).to.not.equal(def);
        });
        
        it('does not copy non-defined elements', function() {
            const schema = Schema({
                name: { type: String }
            });
            const config = { name: 'Tom', age: 15 };
            expect(schema.normalize(config)).to.not.haveOwnProperty('age');
        });

        it('does not fill no-default elements', function() {
            const schema = Schema({
                name: { type: String }
            });
            expect(schema.normalize({})).to.not.haveOwnProperty('name');
        });
        
    });

});