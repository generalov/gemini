'use strict';

const Suite = require('lib/suite');
const OnlyBuilder = require('lib/tests-api/skip/only-builder');

describe('tests-api/skip/only-builder', () => {
    const sandbox = sinon.sandbox.create();
    let rootSuite;
    let suite;
    let onlyBuilder;

    beforeEach(() => {
        rootSuite = Suite.create('');
        suite = Suite.create('some-suite', rootSuite);
        onlyBuilder = new OnlyBuilder(suite);
    });

    afterEach(() => {
        sandbox.restore();
    });

    const errorMessage = 'Browsers must be array of strings or RegExp objects';

    describe('in', () => {
        it('should throw without an argument', () => {
            assert.throws(() => {
                onlyBuilder.in();
            }, TypeError, errorMessage);
        });

        it('should throw if an argument is not a string or RegExp', () => {
            assert.throws(() => {
                onlyBuilder.in(0);
            }, TypeError, errorMessage);
        });

        it('should throw if argument is an array of non-strings or non-RegExps', () => {
            assert.throws(() => {
                onlyBuilder.in([false]);
            }, TypeError, errorMessage);
        });

        it('should remove all browsers if argument is an empty array', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.in([]);

            assert.deepEqual(suite.browsers, []);
        });

        it('should filter suite browsers by a string', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.in('chrome');

            assert.deepEqual(suite.browsers, ['chrome']);
        });

        it('should filter suite browsers by a RegExp', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.in(/ie.+/);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
        });

        it('should filter suite browsers by an array of strings', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.in(['chrome', 'ie8']);

            assert.deepEqual(suite.browsers, ['ie8', 'chrome']);
        });

        it('should filter suite browsers by an array of RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.in([/ie.+/]);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
        });

        it('should filter suite browsers by an array of strings and RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.in([/ie.+/, 'chrome']);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
        });

        it('should filter suite browsers by strings and RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.in(/ie.+/, 'chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
        });

        it('should not set a browser for a suite if it is not specified in a root one', () => {
            rootSuite.browsers = ['opera'];

            onlyBuilder.in('chrome');

            assert.deepEqual(suite.browsers, []);
        });

        it('should be chainable', () => {
            assert.equal(onlyBuilder.in([]), onlyBuilder);
        });

        it('should filter browsers in all children suites', () => {
            const firstChild = Suite.create('firstChild', suite);
            const secondChild = Suite.create('secondChild', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.in([/ie.+/, 'chrome']);
            new OnlyBuilder(firstChild).in(/ie.+/);
            new OnlyBuilder(secondChild).in('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            assert.deepEqual(firstChild.browsers, ['ie8', 'ie9']);
            assert.deepEqual(secondChild.browsers, ['chrome']);
        });

        it('should pass filtered browsers from a parent suite to a child one', () => {
            const childSuite = Suite.create('child', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.in('chrome');

            assert.deepEqual(childSuite.browsers, ['chrome']);
        });
    });

    describe('notIn', () => {
        it('should throw without an argument', () => {
            assert.throws(() => {
                onlyBuilder.notIn();
            }, TypeError, errorMessage);
        });

        it('should throw if an argument is not a string or RegExp', () => {
            assert.throws(() => {
                onlyBuilder.notIn(0);
            }, TypeError, errorMessage);
        });

        it('should throw if an argument is an array of non-strings or non-RegExps', () => {
            assert.throws(() => {
                onlyBuilder.notIn([false]);
            }, TypeError, errorMessage);
        });

        it('should do nothing if argument is an empty array', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.notIn([]);

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
        });

        it('should filter suite browsers by a string', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.notIn('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9']);
        });

        it('should filter suite browsers by a RegExp', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.notIn(/ie.+/);

            assert.deepEqual(suite.browsers, ['chrome']);
        });

        it('should filter suite browsers by an array of strings', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.notIn(['chrome', 'ie8']);

            assert.deepEqual(suite.browsers, ['ie9']);
        });

        it('should filter suite browsers by an array of RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'chrome'];

            onlyBuilder.notIn([/ie.+/]);

            assert.deepEqual(suite.browsers, ['chrome']);
        });

        it('should filter suite browsers by an array of strings and RegExps', () => {
            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.notIn([/ie.+/, 'chrome']);

            assert.deepEqual(suite.browsers, ['opera']);
        });

        it('should not set a browser for a suite if all browsers are excluded', () => {
            rootSuite.browsers = ['opera'];

            onlyBuilder.notIn('opera');

            assert.deepEqual(suite.browsers, []);
        });

        it('should be chainable', () => {
            assert.equal(onlyBuilder.notIn([]), onlyBuilder);
        });

        it('should filter browsers in all children suites', () => {
            const firstChild = Suite.create('firstChild', suite);
            const secondChild = Suite.create('secondChild', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.notIn(['opera']);
            new OnlyBuilder(firstChild).notIn(/ie.+/);
            new OnlyBuilder(secondChild).notIn('chrome');

            assert.deepEqual(suite.browsers, ['ie8', 'ie9', 'chrome']);
            assert.deepEqual(firstChild.browsers, ['chrome']);
            assert.deepEqual(secondChild.browsers, ['ie8', 'ie9']);
        });

        it('should pass filtered browsers from a parent suite to a child one', () => {
            const childSuite = Suite.create('child', suite);

            rootSuite.browsers = ['ie8', 'ie9', 'opera', 'chrome'];

            onlyBuilder.notIn('chrome');

            assert.deepEqual(childSuite.browsers, ['ie8', 'ie9', 'opera']);
        });
    });

    describe('buildAPI', () => {
        let api;

        beforeEach(() => {
            api = onlyBuilder.buildAPI(suite);
        });

        it('should return API methods', () => {
            assert.isObject(api);
            assert.isFunction(api.browsers);
            assert.isFunction(api.only.in);
            assert.isFunction(api.only.notIn);
        });

        describe('only.in', () => {
            it('should call OnlyBuilder\'s .in method', () => {
                sandbox.spy(onlyBuilder, 'in');

                api.only.in('browser1', 'browser2');

                assert.calledWith(onlyBuilder.in, 'browser1', 'browser2');
            });

            it('should return suite', () => {
                const returnValue = api.only.in('browser1', 'browser2');

                assert.equal(returnValue, suite);
            });
        });

        describe('only.notIn', () => {
            it('should call OnlyBuilder\'s .notIn method', () => {
                sandbox.spy(onlyBuilder, 'notIn');

                api.only.notIn(['browser1', 'browser2']);

                assert.calledWith(onlyBuilder.notIn, ['browser1', 'browser2']);
            });

            it('should return suite', () => {
                const returnValue = api.only.notIn('browser1', 'browser2');

                assert.equal(returnValue, suite);
            });
        });

        describe('browsers', () => {
            beforeEach(() => {
                sandbox.spy(onlyBuilder, 'in');
            });

            it('should call OnlyBuilder\'s .in method', () => {
                api.browsers('browser1', 'browser2');

                assert.calledWith(onlyBuilder.in, 'browser1', 'browser2');
            });

            it('should return suite', () => {
                const returnValue = api.browsers('browser1', 'browser2');

                assert.equal(returnValue, suite);
            });
        });
    });
});
